const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Get coach dashboard stats
router.get('/dashboard', async (req, res) => {
    try {
        const coachId = req.query.coachId;

        const totalClients = await prisma.user.count({
            where: { coachId: parseInt(coachId) }
        });

        const clients = await prisma.user.findMany({
            where: { coachId: parseInt(coachId) },
            select: {
                id: true,
                nama: true,
                email: true,
                weight: true,
                height: true,
                imtHistory: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            }
        });

        // Calculate IMT for each client
        const clientsWithIMT = clients.map(client => {
            let imt = null;
            let category = null;

            if (client.imtHistory.length > 0) {
                imt = client.imtHistory[0].imt;
                category = client.imtHistory[0].category;
            } else if (client.weight && client.height) {
                const heightM = client.height / 100;
                imt = client.weight / (heightM * heightM);
                category = getIMTCategory(imt);
            }

            return {
                ...client,
                imt,
                category
            };
        });

        res.json({
            totalClients,
            clients: clientsWithIMT
        });
    } catch (error) {
        console.error('Coach dashboard error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get coach's clients
router.get('/clients', async (req, res) => {
    try {
        const coachId = req.query.coachId;

        const clients = await prisma.user.findMany({
            where: { coachId: parseInt(coachId) },
            select: {
                id: true,
                nama: true,
                email: true,
                phone: true,
                weight: true,
                height: true,
                createdAt: true,
                imtHistory: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                },
                schedules: true
            }
        });

        const clientsWithIMT = clients.map(client => {
            let imt = null;
            let category = null;

            if (client.imtHistory.length > 0) {
                imt = client.imtHistory[0].imt;
                category = client.imtHistory[0].category;
            } else if (client.weight && client.height) {
                const heightM = client.height / 100;
                imt = client.weight / (heightM * heightM);
                category = getIMTCategory(imt);
            }

            return {
                ...client,
                imt: imt ? parseFloat(imt.toFixed(1)) : null,
                category
            };
        });

        res.json(clientsWithIMT);
    } catch (error) {
        console.error('Get coach clients error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get client detail with IMT history
router.get('/clients/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const client = await prisma.user.findUnique({
            where: { id: parseInt(id) },
            select: {
                id: true,
                nama: true,
                email: true,
                phone: true,
                weight: true,
                height: true,
                createdAt: true,
                imtHistory: {
                    orderBy: { createdAt: 'desc' },
                    take: 10
                },
                workoutProofs: {
                    orderBy: { createdAt: 'desc' },
                    take: 10
                },
                recommendations: {
                    orderBy: { createdAt: 'desc' },
                    take: 5
                },
                schedules: true
            }
        });

        if (!client) {
            return res.status(404).json({ message: 'Client tidak ditemukan' });
        }

        // Calculate current IMT
        let imt = null;
        let category = null;

        if (client.imtHistory.length > 0) {
            imt = client.imtHistory[0].imt;
            category = client.imtHistory[0].category;
        } else if (client.weight && client.height) {
            const heightM = client.height / 100;
            imt = client.weight / (heightM * heightM);
            category = getIMTCategory(imt);
        }

        res.json({
            ...client,
            imt: imt ? parseFloat(imt.toFixed(1)) : null,
            category
        });
    } catch (error) {
        console.error('Get client detail error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add recommendation for client
router.post('/clients/:id/recommend', async (req, res) => {
    try {
        const { id } = req.params;
        const { coachId, title, description, exercises } = req.body;

        const recommendation = await prisma.recommendation.create({
            data: {
                clientId: parseInt(id),
                coachId: parseInt(coachId),
                title,
                description,
                exercises: JSON.stringify(exercises)
            }
        });

        res.status(201).json(recommendation);
    } catch (error) {
        console.error('Add recommendation error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all schedules for coach's clients
router.get('/schedule', async (req, res) => {
    try {
        const coachId = req.query.coachId;

        const clients = await prisma.user.findMany({
            where: { coachId: parseInt(coachId) },
            select: {
                id: true,
                nama: true,
                schedules: {
                    orderBy: { date: 'asc' }
                }
            }
        });

        res.json(clients);
    } catch (error) {
        console.error('Get schedule error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add schedule date for client
router.post('/schedule/:clientId', async (req, res) => {
    try {
        const { clientId } = req.params;
        const { date, title } = req.body;

        const schedule = await prisma.schedule.create({
            data: {
                clientId: parseInt(clientId),
                date: new Date(date),
                title: title || 'Latihan'
            }
        });

        res.status(201).json(schedule);
    } catch (error) {
        console.error('Add schedule error:', error);
        if (error.code === 'P2002') {
            return res.status(400).json({ message: 'Tanggal ini sudah dijadwalkan' });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete schedule date
router.delete('/schedule/:scheduleId', async (req, res) => {
    try {
        const { scheduleId } = req.params;

        await prisma.schedule.delete({
            where: { id: parseInt(scheduleId) }
        });

        res.json({ message: 'Jadwal dihapus' });
    } catch (error) {
        console.error('Delete schedule error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Toggle schedule completion
router.put('/schedule/:scheduleId/complete', async (req, res) => {
    try {
        const { scheduleId } = req.params;
        const { completed } = req.body;

        const schedule = await prisma.schedule.update({
            where: { id: parseInt(scheduleId) },
            data: { completed }
        });

        res.json(schedule);
    } catch (error) {
        console.error('Toggle schedule error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get coach videos
router.get('/videos', async (req, res) => {
    try {
        const coachId = req.query.coachId;

        const videos = await prisma.video.findMany({
            where: { coachId: parseInt(coachId) },
            orderBy: { createdAt: 'desc' }
        });

        res.json(videos);
    } catch (error) {
        console.error('Get videos error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add video
router.post('/videos', async (req, res) => {
    try {
        const { coachId, title, description, youtubeUrl, category } = req.body;

        const video = await prisma.video.create({
            data: {
                coachId: parseInt(coachId),
                title,
                description,
                youtubeUrl,
                category
            }
        });

        res.status(201).json(video);
    } catch (error) {
        console.error('Add video error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete video
router.delete('/videos/:id', async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.video.delete({
            where: { id: parseInt(id) }
        });

        res.json({ message: 'Video deleted' });
    } catch (error) {
        console.error('Delete video error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Edit video
router.put('/videos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, youtubeUrl, category } = req.body;

        const video = await prisma.video.update({
            where: { id: parseInt(id) },
            data: {
                title,
                description,
                youtubeUrl,
                category
            }
        });

        res.json(video);
    } catch (error) {
        console.error('Edit video error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get messages with a client
router.get('/messages/:clientId', async (req, res) => {
    try {
        const { clientId } = req.params;
        const coachId = req.query.coachId;

        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: parseInt(coachId), receiverId: parseInt(clientId) },
                    { senderId: parseInt(clientId), receiverId: parseInt(coachId) }
                ]
            },
            orderBy: { createdAt: 'asc' },
            include: {
                sender: {
                    select: { id: true, nama: true }
                }
            }
        });

        // Mark messages as read
        await prisma.message.updateMany({
            where: {
                senderId: parseInt(clientId),
                receiverId: parseInt(coachId),
                isRead: false
            },
            data: { isRead: true }
        });

        res.json(messages);
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Send message
router.post('/messages', async (req, res) => {
    try {
        const { senderId, receiverId, content } = req.body;

        const message = await prisma.message.create({
            data: {
                senderId: parseInt(senderId),
                receiverId: parseInt(receiverId),
                content
            },
            include: {
                sender: {
                    select: { id: true, nama: true }
                }
            }
        });

        res.status(201).json(message);
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get chat list (clients with unread counts)
router.get('/chat-list', async (req, res) => {
    try {
        const coachId = req.query.coachId;

        const clients = await prisma.user.findMany({
            where: { coachId: parseInt(coachId) },
            select: {
                id: true,
                nama: true,
                email: true
            }
        });

        // Get unread message counts
        const clientsWithUnread = await Promise.all(
            clients.map(async (client) => {
                const unreadCount = await prisma.message.count({
                    where: {
                        senderId: client.id,
                        receiverId: parseInt(coachId),
                        isRead: false
                    }
                });

                const lastMessage = await prisma.message.findFirst({
                    where: {
                        OR: [
                            { senderId: parseInt(coachId), receiverId: client.id },
                            { senderId: client.id, receiverId: parseInt(coachId) }
                        ]
                    },
                    orderBy: { createdAt: 'desc' }
                });

                return {
                    ...client,
                    unreadCount,
                    lastMessage
                };
            })
        );

        res.json(clientsWithUnread);
    } catch (error) {
        console.error('Get chat list error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get food recommendations for a client
router.get('/food-recommendations/:clientId', async (req, res) => {
    try {
        const { clientId } = req.params;

        const recommendations = await prisma.foodRecommendation.findMany({
            where: { clientId: parseInt(clientId) },
            orderBy: { createdAt: 'desc' }
        });

        res.json(recommendations);
    } catch (error) {
        console.error('Get food recommendations error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add food recommendation
router.post('/food-recommendations', async (req, res) => {
    try {
        const { clientId, coachId, title, description, foods, mealType } = req.body;

        const recommendation = await prisma.foodRecommendation.create({
            data: {
                clientId: parseInt(clientId),
                coachId: parseInt(coachId),
                title,
                description,
                foods: JSON.stringify(foods),
                mealType
            }
        });

        res.status(201).json(recommendation);
    } catch (error) {
        console.error('Add food recommendation error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete food recommendation
router.delete('/food-recommendations/:id', async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.foodRecommendation.delete({
            where: { id: parseInt(id) }
        });

        res.json({ message: 'Saran makanan berhasil dihapus' });
    } catch (error) {
        console.error('Delete food recommendation error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Helper function to get IMT category
function getIMTCategory(imt) {
    if (imt < 18.5) return 'kurus';
    if (imt < 25) return 'normal';
    if (imt < 30) return 'overweight';
    return 'obesitas';
}

module.exports = router;


const express = require('express');
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const path = require('path');

const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for file uploads (max 5MB)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'workout-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Hanya file gambar yang diperbolehkan (jpg, png, gif, webp)'));
        }
    }
});

// Get client dashboard
router.get('/dashboard', async (req, res) => {
    try {
        const clientId = req.query.clientId;

        const client = await prisma.user.findUnique({
            where: { id: parseInt(clientId) },
            select: {
                id: true,
                nama: true,
                weight: true,
                height: true,
                coach: {
                    select: { id: true, nama: true }
                },
                schedules: {
                    orderBy: { date: 'asc' }
                },
                imtHistory: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            }
        });

        if (!client) {
            return res.status(404).json({ message: 'Client tidak ditemukan' });
        }

        // Calculate IMT
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

        // Check today's schedule (date-based)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todaySchedule = client.schedules.find(s => {
            const schedDate = new Date(s.date);
            schedDate.setHours(0, 0, 0, 0);
            return schedDate.getTime() === today.getTime();
        });

        const hasTodayWorkout = !!todaySchedule;

        // Check if workout done today
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const todayProof = await prisma.workoutProof.findFirst({
            where: {
                clientId: parseInt(clientId),
                createdAt: { gte: todayStart }
            }
        });

        res.json({
            ...client,
            imt: imt ? parseFloat(imt.toFixed(2)) : null,
            category,
            hasTodayWorkout,
            workoutDone: !!todayProof || (todaySchedule?.completed ?? false)
        });
    } catch (error) {
        console.error('Client dashboard error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update weight/height (Input IMT)
router.post('/imt', async (req, res) => {
    try {
        const { clientId, weight, height } = req.body;

        const heightM = height / 100;
        const imt = weight / (heightM * heightM);
        const category = getIMTCategory(imt);

        // Update user
        await prisma.user.update({
            where: { id: parseInt(clientId) },
            data: { weight, height }
        });

        // Add to history
        const history = await prisma.iMTHistory.create({
            data: {
                clientId: parseInt(clientId),
                weight,
                height,
                imt,
                category
            }
        });

        res.json({
            imt: parseFloat(imt.toFixed(2)),
            category,
            history
        });
    } catch (error) {
        console.error('Update IMT error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get IMT history
router.get('/imt-history', async (req, res) => {
    try {
        const clientId = req.query.clientId;

        const history = await prisma.iMTHistory.findMany({
            where: { clientId: parseInt(clientId) },
            orderBy: { createdAt: 'desc' },
            take: 30
        });

        res.json(history);
    } catch (error) {
        console.error('Get IMT history error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get client schedule
router.get('/schedule', async (req, res) => {
    try {
        const clientId = req.query.clientId;

        const schedules = await prisma.schedule.findMany({
            where: { clientId: parseInt(clientId) },
            orderBy: { date: 'asc' }
        });

        // Get workout proofs
        const proofs = await prisma.workoutProof.findMany({
            where: { clientId: parseInt(clientId) },
            orderBy: { createdAt: 'desc' }
        });

        res.json({ schedules, proofs });
    } catch (error) {
        console.error('Get schedule error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Mark workout as done - NOW REQUIRES PHOTO
router.post('/workout-done', upload.single('photo'), async (req, res) => {
    try {
        const { clientId, notes } = req.body;

        // Photo is required
        if (!req.file) {
            return res.status(400).json({ message: 'Foto bukti latihan wajib diupload' });
        }

        const imageUrl = '/uploads/' + req.file.filename;

        const proof = await prisma.workoutProof.create({
            data: {
                clientId: parseInt(clientId),
                notes: notes || 'Latihan selesai',
                imageUrl
            }
        });

        res.status(201).json(proof);
    } catch (error) {
        console.error('Mark workout done error:', error);
        if (error.message.includes('file')) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

// Get recommendations
router.get('/recommendations', async (req, res) => {
    try {
        const clientId = req.query.clientId;

        const recommendations = await prisma.recommendation.findMany({
            where: { clientId: parseInt(clientId) },
            orderBy: { createdAt: 'desc' }
        });

        res.json(recommendations);
    } catch (error) {
        console.error('Get recommendations error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get food recommendations
router.get('/food-recommendations', async (req, res) => {
    try {
        const clientId = req.query.clientId;

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

// Get videos for client (based on category)
router.get('/videos', async (req, res) => {
    try {
        const clientId = req.query.clientId;

        // Get client's category
        const client = await prisma.user.findUnique({
            where: { id: parseInt(clientId) },
            select: {
                coachId: true,
                imtHistory: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            }
        });

        const category = client?.imtHistory?.[0]?.category || 'normal';

        // Get videos from coach matching category
        const videos = await prisma.video.findMany({
            where: {
                OR: [
                    { coachId: client?.coachId },
                    { category }
                ]
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(videos);
    } catch (error) {
        console.error('Get client videos error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get workout proofs (progress)
router.get('/progress', async (req, res) => {
    try {
        const clientId = req.query.clientId;

        const proofs = await prisma.workoutProof.findMany({
            where: { clientId: parseInt(clientId) },
            orderBy: { createdAt: 'desc' }
        });

        res.json(proofs);
    } catch (error) {
        console.error('Get progress error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add workout proof with photo
router.post('/progress', upload.single('photo'), async (req, res) => {
    try {
        const { clientId, notes } = req.body;

        // Photo is required
        if (!req.file) {
            return res.status(400).json({ message: 'Foto bukti latihan wajib diupload' });
        }

        const imageUrl = '/uploads/' + req.file.filename;

        const proof = await prisma.workoutProof.create({
            data: {
                clientId: parseInt(clientId),
                notes,
                imageUrl
            }
        });

        res.status(201).json(proof);
    } catch (error) {
        console.error('Add progress error:', error);
        if (error.message.includes('file')) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

// Get messages with coach
router.get('/messages', async (req, res) => {
    try {
        const clientId = req.query.clientId;

        // Get client's coach
        const client = await prisma.user.findUnique({
            where: { id: parseInt(clientId) },
            select: { coachId: true }
        });

        if (!client?.coachId) {
            return res.json([]);
        }

        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: parseInt(clientId), receiverId: client.coachId },
                    { senderId: client.coachId, receiverId: parseInt(clientId) }
                ]
            },
            orderBy: { createdAt: 'asc' },
            include: {
                sender: {
                    select: { id: true, nama: true }
                }
            }
        });

        // Mark as read
        await prisma.message.updateMany({
            where: {
                senderId: client.coachId,
                receiverId: parseInt(clientId),
                isRead: false
            },
            data: { isRead: true }
        });

        res.json(messages);
    } catch (error) {
        console.error('Get client messages error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Send message to coach
router.post('/messages', async (req, res) => {
    try {
        const { clientId, content } = req.body;

        // Get client's coach
        const client = await prisma.user.findUnique({
            where: { id: parseInt(clientId) },
            select: { coachId: true }
        });

        if (!client?.coachId) {
            return res.status(400).json({ message: 'Anda belum memiliki coach' });
        }

        const message = await prisma.message.create({
            data: {
                senderId: parseInt(clientId),
                receiverId: client.coachId,
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
        console.error('Send client message error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Helper function
function getIMTCategory(imt) {
    if (imt < 18.5) return 'kurus';
    if (imt < 25) return 'normal';
    if (imt < 30) return 'overweight';
    return 'obesitas';
}

// Error handler for multer
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'Ukuran file maksimal 5MB' });
        }
    }
    next(error);
});

module.exports = router;

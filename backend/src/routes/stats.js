const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Get dashboard stats
router.get('/', async (req, res) => {
    try {
        const [totalClients, totalCoaches, totalVideos, totalConsultations] = await Promise.all([
            prisma.user.count({ where: { role: 'CLIENT' } }),
            prisma.user.count({ where: { role: 'COACH' } }),
            prisma.video.count(),
            prisma.message.count()
        ]);

        res.json({
            totalClients,
            totalCoaches,
            totalVideos,
            totalConsultations
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

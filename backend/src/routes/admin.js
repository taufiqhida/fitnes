const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Get all videos with coach info (for admin)
router.get('/videos', async (req, res) => {
    try {
        const videos = await prisma.video.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                coach: {
                    select: {
                        id: true,
                        nama: true,
                        email: true
                    }
                }
            }
        });

        res.json(videos);
    } catch (error) {
        console.error('Get all videos error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

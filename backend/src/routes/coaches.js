const express = require('express');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Get all coaches
router.get('/', async (req, res) => {
    try {
        const coaches = await prisma.user.findMany({
            where: { role: 'COACH' },
            select: {
                id: true,
                nama: true,
                email: true,
                phone: true,
                createdAt: true,
                _count: {
                    select: { clients: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(coaches);
    } catch (error) {
        console.error('Get coaches error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create coach
router.post('/', async (req, res) => {
    try {
        const { nama, email, password, phone } = req.body;

        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(400).json({ message: 'Email sudah terdaftar' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const coach = await prisma.user.create({
            data: {
                nama,
                email,
                password: hashedPassword,
                phone,
                role: 'COACH'
            },
            select: {
                id: true,
                nama: true,
                email: true,
                phone: true,
                createdAt: true
            }
        });

        res.status(201).json(coach);
    } catch (error) {
        console.error('Create coach error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update coach
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nama, email, phone, password } = req.body;

        const updateData = { nama, email, phone };

        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const coach = await prisma.user.update({
            where: { id: parseInt(id) },
            data: updateData,
            select: {
                id: true,
                nama: true,
                email: true,
                phone: true,
                createdAt: true
            }
        });

        res.json(coach);
    } catch (error) {
        console.error('Update coach error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete coach
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Remove coach assignment from clients first
        await prisma.user.updateMany({
            where: { coachId: parseInt(id) },
            data: { coachId: null }
        });

        await prisma.user.delete({
            where: { id: parseInt(id) }
        });

        res.json({ message: 'Pelatih berhasil dihapus' });
    } catch (error) {
        console.error('Delete coach error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

const express = require('express');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Get all clients
router.get('/', async (req, res) => {
    try {
        const clients = await prisma.user.findMany({
            where: { role: 'CLIENT' },
            select: {
                id: true,
                nama: true,
                email: true,
                phone: true,
                createdAt: true,
                coachId: true,
                coach: {
                    select: {
                        id: true,
                        nama: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(clients);
    } catch (error) {
        console.error('Get clients error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create client
router.post('/', async (req, res) => {
    try {
        const { nama, email, password, phone, coachId } = req.body;

        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(400).json({ message: 'Email sudah terdaftar' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const client = await prisma.user.create({
            data: {
                nama,
                email,
                password: hashedPassword,
                phone,
                role: 'CLIENT',
                coachId: coachId ? parseInt(coachId) : null
            },
            select: {
                id: true,
                nama: true,
                email: true,
                phone: true,
                createdAt: true,
                coach: {
                    select: {
                        id: true,
                        nama: true
                    }
                }
            }
        });

        res.status(201).json(client);
    } catch (error) {
        console.error('Create client error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update client
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nama, email, phone, password, coachId } = req.body;

        const updateData = {
            nama,
            email,
            phone,
            coachId: coachId ? parseInt(coachId) : null
        };

        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const client = await prisma.user.update({
            where: { id: parseInt(id) },
            data: updateData,
            select: {
                id: true,
                nama: true,
                email: true,
                phone: true,
                createdAt: true,
                coach: {
                    select: {
                        id: true,
                        nama: true
                    }
                }
            }
        });

        res.json(client);
    } catch (error) {
        console.error('Update client error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Assign coach to client
router.put('/:id/assign', async (req, res) => {
    try {
        const { id } = req.params;
        const { coachId } = req.body;

        const client = await prisma.user.update({
            where: { id: parseInt(id) },
            data: { coachId: coachId ? parseInt(coachId) : null },
            select: {
                id: true,
                nama: true,
                email: true,
                phone: true,
                createdAt: true,
                coach: {
                    select: {
                        id: true,
                        nama: true
                    }
                }
            }
        });

        res.json(client);
    } catch (error) {
        console.error('Assign coach error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete client
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.user.delete({
            where: { id: parseInt(id) }
        });

        res.json({ message: 'Client berhasil dihapus' });
    } catch (error) {
        console.error('Delete client error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

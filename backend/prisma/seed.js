const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin', 10);
    const admin = await prisma.user.upsert({
        where: { phone: 'admin' },
        update: {},
        create: {
            nama: 'Administrator',
            phone: 'admin',
            password: adminPassword,
            role: 'ADMIN'
        }
    });
    console.log('Created admin:', admin.phone);

    // Create demo coach
    const coachPassword = await bcrypt.hash('pelatih', 10);
    const coach = await prisma.user.upsert({
        where: { phone: 'pelatih' },
        update: {},
        create: {
            nama: 'Coach Budi',
            phone: 'pelatih',
            password: coachPassword,
            role: 'COACH'
        }
    });
    console.log('Created coach:', coach.phone);

    // Create demo client
    const clientPassword = await bcrypt.hash('client', 10);
    const client = await prisma.user.upsert({
        where: { phone: 'client' },
        update: {},
        create: {
            nama: 'Dewi Lestari',
            phone: 'client',
            password: clientPassword,
            role: 'CLIENT',
            weight: 55,
            height: 160,
            coachId: coach.id
        }
    });
    console.log('Created client:', client.phone);

    // Add IMT history for client
    const heightM = 160 / 100;
    const imt = 55 / (heightM * heightM);
    await prisma.iMTHistory.upsert({
        where: { id: 1 },
        update: {},
        create: {
            clientId: client.id,
            weight: 55,
            height: 160,
            imt: imt,
            category: 'normal'
        }
    });

    // Create sample schedule dates for January 2026
    const schedulesDates = [
        new Date('2026-01-10'),
        new Date('2026-01-13'),
        new Date('2026-01-15'),
        new Date('2026-01-17'),
        new Date('2026-01-20'),
        new Date('2026-01-22'),
        new Date('2026-01-24'),
        new Date('2026-01-27'),
        new Date('2026-01-29'),
        new Date('2026-01-31'),
    ];

    for (const date of schedulesDates) {
        try {
            await prisma.schedule.create({
                data: {
                    clientId: client.id,
                    date: date,
                    title: 'Latihan Rutin'
                }
            });
        } catch (e) {
            // Skip if already exists
        }
    }
    console.log('Created sample schedules');

    // Add sample videos for coach
    const videos = [
        { title: 'Latihan Kardio Pemula', description: 'Latihan kardio 15 menit untuk pemula', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', category: 'normal' },
        { title: 'Workout untuk Obesitas', description: 'Latihan low impact untuk menurunkan berat badan', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', category: 'obesitas' },
        { title: 'Zumba Dance', description: 'Zumba dance workout 30 menit', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', category: 'normal' }
    ];

    for (const video of videos) {
        await prisma.video.create({
            data: {
                ...video,
                coachId: coach.id
            }
        });
    }
    console.log('Created sample videos');

    console.log('Seeding completed!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

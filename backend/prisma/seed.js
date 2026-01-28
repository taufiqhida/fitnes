const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Helper function to generate attendance dates with varied completion rates
function generateAttendanceDates(completionRate = 0.8) {
    const dates = [];
    const today = new Date('2026-01-27'); // Current date
    const twoMonthsAgo = new Date(today);
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

    // Generate dates for 2 months (approximately 8 weeks)
    // 2 times per week = 16 potential attendances
    let currentDate = new Date(twoMonthsAgo);

    while (currentDate <= today) {
        const dayOfWeek = currentDate.getDay();

        // Add attendance on Monday (1) and Thursday (4)
        if (dayOfWeek === 1 || dayOfWeek === 4) {
            // Add with probability based on completion rate
            if (Math.random() < completionRate) {
                dates.push(new Date(currentDate));
            }
        }

        currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
}

// Helper function to generate attendance dates (6x per week - Monday to Saturday) with variations
function generateIntensiveAttendanceDates(completionRate = 0.9) {
    const dates = [];
    const today = new Date('2026-01-27'); // Current date
    const twoMonthsAgo = new Date(today);
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

    // Generate dates for 2 months
    // 6 times per week (Monday-Saturday) = ~48-52 total attendances
    let currentDate = new Date(twoMonthsAgo);

    while (currentDate <= today) {
        const dayOfWeek = currentDate.getDay();

        // Add attendance on Monday(1) to Saturday(6), exclude Sunday(0)
        if (dayOfWeek >= 1 && dayOfWeek <= 6) {
            // Add with probability based on completion rate
            if (Math.random() < completionRate) {
                dates.push(new Date(currentDate));
            }
        }

        currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
}

// Helper function to generate weight progression over time
// progressionType: 'loss', 'gain', 'stable', 'fluctuate'
function generateWeightProgression(initialWeight, progressionType, months = 4) {
    const progression = [];
    const today = new Date('2026-01-27');

    let currentWeight = initialWeight;

    // Generate monthly records from 4 months ago to now
    for (let i = months; i >= 0; i--) {
        const date = new Date(today);
        date.setMonth(date.getMonth() - i);

        let weightChange = 0;

        switch (progressionType) {
            case 'loss':
                // Losing 0.5-1.5 kg per month
                weightChange = -(Math.random() * 1 + 0.5);
                break;
            case 'gain':
                // Gaining 0.5-1.5 kg per month
                weightChange = Math.random() * 1 + 0.5;
                break;
            case 'stable':
                // Fluctuating ±0.5 kg
                weightChange = (Math.random() - 0.5) * 1;
                break;
            case 'fluctuate':
                // Random fluctuation ±1.5 kg
                weightChange = (Math.random() - 0.5) * 3;
                break;
        }

        currentWeight = Math.max(40, currentWeight + weightChange); // Minimum 40kg

        progression.push({
            date: new Date(date),
            weight: Math.round(currentWeight * 10) / 10 // Round to 1 decimal
        });
    }

    return progression;
}

// Helper function to calculate IMT
function calculateIMT(weight, height) {
    const heightM = height / 100;
    return weight / (heightM * heightM);
}

// Helper function to get IMT category
function getIMTCategory(imt) {
    if (imt < 18.5) return 'kurus';
    if (imt < 25) return 'normal';
    if (imt < 30) return 'overweight';
    return 'obesitas';
}

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

    // Create demo coaches
    const coachPassword = await bcrypt.hash('pelatih', 10);
    const coachBudi = await prisma.user.upsert({
        where: { phone: 'pelatih' },
        update: {},
        create: {
            nama: 'Coach Budi',
            phone: 'pelatih',
            password: coachPassword,
            role: 'COACH'
        }
    });
    console.log('Created coach:', coachBudi.phone);

    const coachLarisa = await prisma.user.upsert({
        where: { phone: 'larisa' },
        update: {},
        create: {
            nama: 'Coach Larisa',
            phone: 'larisa',
            password: coachPassword,
            role: 'COACH'
        }
    });
    console.log('Created coach:', coachLarisa.phone);

    // Define 10 clients with varying physical attributes and progression types
    const clientsData = [
        { nama: 'Andi Pratama', phone: '081234567801', weight: 70, height: 175, progression: 'loss', attendance: 0.9 },
        { nama: 'Siti Nurhaliza', phone: '081234567802', weight: 58, height: 160, progression: 'stable', attendance: 0.85 },
        { nama: 'Budi Santoso', phone: '081234567803', weight: 85, height: 178, progression: 'loss', attendance: 0.7 },
        { nama: 'Dewi Lestari', phone: '081234567804', weight: 55, height: 165, progression: 'gain', attendance: 0.95 },
        { nama: 'Eko Prasetyo', phone: '081234567805', weight: 90, height: 172, progression: 'loss', attendance: 0.6 },
        { nama: 'Fitri Handayani', phone: '081234567806', weight: 62, height: 158, progression: 'stable', attendance: 0.8 },
        { nama: 'Galih Permana', phone: '081234567807', weight: 75, height: 180, progression: 'loss', attendance: 0.75 },
        { nama: 'Hani Wijaya', phone: '081234567808', weight: 52, height: 162, progression: 'gain', attendance: 0.9 },
        { nama: 'Irfan Hakim', phone: '081234567809', weight: 78, height: 176, progression: 'fluctuate', attendance: 0.65 },
        { nama: 'Julia Permatasari', phone: '081234567810', weight: 60, height: 168, progression: 'stable', attendance: 0.85 }
    ];

    // Define 15 additional intensive training clients for Coach Larisa with progression types
    const intensiveClientsData = [
        { nama: 'Rahmat Hidayat', phone: '081234567811', weight: 72, height: 174, progression: 'loss', attendance: 0.95 },
        { nama: 'Lina Marlina', phone: '081234567812', weight: 56, height: 161, progression: 'stable', attendance: 0.9 },
        { nama: 'Dimas Prasetyo', phone: '081234567813', weight: 82, height: 177, progression: 'loss', attendance: 0.85 },
        { nama: 'Nina Safitri', phone: '081234567814', weight: 58, height: 164, progression: 'gain', attendance: 0.92 },
        { nama: 'Agus Setiawan', phone: '081234567815', weight: 76, height: 173, progression: 'loss', attendance: 0.88 },
        { nama: 'Rina Wulandari', phone: '081234567816', weight: 54, height: 159, progression: 'gain', attendance: 0.93 },
        { nama: 'Faisal Ahmad', phone: '081234567817', weight: 80, height: 179, progression: 'loss', attendance: 0.87 },
        { nama: 'Maya Sari', phone: '081234567818', weight: 59, height: 163, progression: 'stable', attendance: 0.91 },
        { nama: 'Rudi Hartono', phone: '081234567819', weight: 74, height: 175, progression: 'fluctuate', attendance: 0.8 },
        { nama: 'Sari Indah', phone: '081234567820', weight: 57, height: 160, progression: 'stable', attendance: 0.94 },
        { nama: 'Yoga Pratama', phone: '081234567821', weight: 77, height: 176, progression: 'loss', attendance: 0.89 },
        { nama: 'Tika Dewi', phone: '081234567822', weight: 61, height: 162, progression: 'stable', attendance: 0.9 },
        { nama: 'Bambang Santoso', phone: '081234567823', weight: 83, height: 178, progression: 'loss', attendance: 0.86 },
        { nama: 'Wati Suryani', phone: '081234567824', weight: 55, height: 158, progression: 'gain', attendance: 0.95 },
        { nama: 'Hendra Gunawan', phone: '081234567825', weight: 79, height: 177, progression: 'loss', attendance: 0.91 }
    ];

    const clientPassword = await bcrypt.hash('client123', 10);

    // Create 10 clients with attendance records
    // Distribute clients evenly: first 5 to Coach Budi, next 5 to Coach Larisa
    // Registration date: 4 months ago
    const fourMonthsAgo = new Date('2026-01-27');
    fourMonthsAgo.setMonth(fourMonthsAgo.getMonth() - 4);

    for (let i = 0; i < clientsData.length; i++) {
        const clientData = clientsData[i];
        const assignedCoach = i < 5 ? coachBudi : coachLarisa;

        // Generate weight progression for this client
        const weightProgression = generateWeightProgression(
            clientData.weight,
            clientData.progression,
            4
        );

        // Current weight is the latest in progression
        const currentWeight = weightProgression[weightProgression.length - 1].weight;

        // Create client
        const client = await prisma.user.upsert({
            where: { phone: clientData.phone },
            update: {},
            create: {
                nama: clientData.nama,
                phone: clientData.phone,
                password: clientPassword,
                role: 'CLIENT',
                weight: currentWeight,
                height: clientData.height,
                coachId: assignedCoach.id,
                createdAt: fourMonthsAgo
            }
        });
        console.log(`Created client ${i + 1}/10:`, client.nama, `- Coach: ${assignedCoach.nama}, Pattern: ${clientData.progression}`);

        // Create IMT history for each weight progression point
        for (const record of weightProgression) {
            const imt = calculateIMT(record.weight, clientData.height);
            const category = getIMTCategory(imt);

            await prisma.iMTHistory.create({
                data: {
                    clientId: client.id,
                    weight: record.weight,
                    height: clientData.height,
                    imt: imt,
                    category: category,
                    createdAt: record.date
                }
            });
        }
        console.log(`  - Created ${weightProgression.length} IMT history records`);

        // Generate attendance dates with varied completion rate
        const attendanceDates = generateAttendanceDates(clientData.attendance);

        // Create attendance records (completed schedules)
        for (const date of attendanceDates) {
            try {
                await prisma.schedule.create({
                    data: {
                        clientId: client.id,
                        date: date,
                        title: 'Latihan Rutin',
                        completed: true
                    }
                });
            } catch (e) {
                // Skip if already exists (duplicate clientId + date)
            }
        }
        console.log(`  - Created ${attendanceDates.length} attendance records (${Math.round(clientData.attendance * 100)}% rate)`);
    }

    // Create 15 intensive training clients for Coach Larisa
    // These clients train 6 days per week (Monday-Saturday)
    // Registration date: 4 months ago
    console.log(`\nCreating ${intensiveClientsData.length} intensive training clients for Coach Larisa...`);

    for (let i = 0; i < intensiveClientsData.length; i++) {
        const clientData = intensiveClientsData[i];

        // Generate weight progression for this client
        const weightProgression = generateWeightProgression(
            clientData.weight,
            clientData.progression,
            4
        );

        // Current weight is the latest in progression
        const currentWeight = weightProgression[weightProgression.length - 1].weight;

        // Create client assigned to Coach Larisa
        const client = await prisma.user.upsert({
            where: { phone: clientData.phone },
            update: {},
            create: {
                nama: clientData.nama,
                phone: clientData.phone,
                password: clientPassword,
                role: 'CLIENT',
                weight: currentWeight,
                height: clientData.height,
                coachId: coachLarisa.id,
                createdAt: fourMonthsAgo
            }
        });
        console.log(`Created intensive client ${i + 1}/15:`, client.nama, `- Coach: ${coachLarisa.nama}, Pattern: ${clientData.progression}`);

        // Create IMT history for each weight progression point
        for (const record of weightProgression) {
            const imt = calculateIMT(record.weight, clientData.height);
            const category = getIMTCategory(imt);

            await prisma.iMTHistory.create({
                data: {
                    clientId: client.id,
                    weight: record.weight,
                    height: clientData.height,
                    imt: imt,
                    category: category,
                    createdAt: record.date
                }
            });
        }
        console.log(`  - Created ${weightProgression.length} IMT history records`);

        // Generate attendance dates with varied completion rate
        const intensiveAttendanceDates = generateIntensiveAttendanceDates(clientData.attendance);

        // Create attendance records (completed schedules) - 6 days per week
        for (const date of intensiveAttendanceDates) {
            try {
                await prisma.schedule.create({
                    data: {
                        clientId: client.id,
                        date: date,
                        title: 'Latihan Intensif',
                        completed: true
                    }
                });
            } catch (e) {
                // Skip if already exists (duplicate clientId + date)
            }
        }
        console.log(`  - Created ${intensiveAttendanceDates.length} attendance records (${Math.round(clientData.attendance * 100)}% rate, Mon-Sat)`);
    }

    // Add 100 exercise videos for coach
    const exerciseTypes = [
        'Kardio', 'Strength Training', 'Yoga', 'Pilates', 'Zumba', 'HIIT',
        'Boxing', 'Dance', 'Aerobik', 'Stretching', 'Core Workout', 'Cycling',
        'Running', 'Walking', 'Swimming', 'Functional Training', 'Crossfit',
        'Bodyweight', 'Resistance Band', 'Kettlebell', 'Dumbbell', 'Barbell'
    ];

    const intensities = ['Pemula', 'Menengah', 'Lanjutan', 'Intensif'];
    const durations = ['10 menit', '15 menit', '20 menit', '30 menit', '45 menit', '60 menit'];
    const categories = ['kurus', 'normal', 'overweight', 'obesitas'];

    const videos = [];

    for (let i = 1; i <= 100; i++) {
        const exerciseType = exerciseTypes[i % exerciseTypes.length];
        const intensity = intensities[i % intensities.length];
        const duration = durations[i % durations.length];
        const category = categories[i % categories.length];

        videos.push({
            title: `${exerciseType} ${intensity} #${i}`,
            description: `Latihan ${exerciseType.toLowerCase()} level ${intensity.toLowerCase()} selama ${duration}. Cocok untuk kategori ${category}.`,
            youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            category: category
        });
    }

    // Assign videos to coaches: first 50 to Coach Budi, next 50 to Coach Larisa
    for (let i = 0; i < videos.length; i++) {
        const video = videos[i];
        const assignedCoach = i < 50 ? coachBudi : coachLarisa;

        try {
            await prisma.video.create({
                data: {
                    ...video,
                    coachId: assignedCoach.id
                }
            });
        } catch (e) {
            // Skip if already exists
        }
    }
    console.log('Created 100 exercise videos (50 per coach)');

    console.log('\n=== Seeding completed! ===');
    console.log('Total coaches: 2');
    console.log('  - Coach Budi: 5 clients, 50 videos');
    console.log('  - Coach Larisa: 20 clients (5 regular + 15 intensive), 50 videos');
    console.log('Total clients created: 25');
    console.log('  - Regular clients (2x/week): 10 clients (~16 records each)');
    console.log('  - Intensive clients (6x/week): 15 clients (varied attendance)');
    console.log('Total videos: 100');
    console.log('\nLogin credentials:');
    console.log('- Admin: phone=admin, password=admin');
    console.log('- Coach Budi: phone=pelatih, password=pelatih');
    console.log('- Coach Larisa: phone=larisa, password=pelatih');
    console.log('- Regular Clients: phone=081234567801-810, password=client123');
    console.log('- Intensive Clients: phone=081234567811-825, password=client123');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

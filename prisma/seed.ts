import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create users
  await prisma.user.upsert({
    where: { email: 'admin@itike.rw' },
    update: {},
    create: {
      email: 'admin@itike.rw',
      password: await bcrypt.hash('admin123', 12),
      name: 'Admin User',
      role: 'ADMIN',
    },
  });

  const busOperator1 = await prisma.user.upsert({
    where: { email: 'operator1@itike.rw' },
    update: {},
    create: {
      email: 'operator1@itike.rw',
      password: await bcrypt.hash('operator123', 12),
      name: 'Volcano Express Operator',
      role: 'BUS_OPERATOR',
    },
  });

  const busOperator2 = await prisma.user.upsert({
    where: { email: 'operator2@itike.rw' },
    update: {},
    create: {
      email: 'operator2@itike.rw',
      password: await bcrypt.hash('operator123', 12),
      name: 'Horizon Express Operator',
      role: 'BUS_OPERATOR',
    },
  });

  await prisma.user.upsert({
    where: { email: 'user@itike.rw' },
    update: {},
    create: {
      email: 'user@itike.rw',
      password: await bcrypt.hash('user123', 12),
      name: 'Regular User',
      phone: '+250788123456',
      role: 'USER',
    },
  });

  // Create bus companies
  const volcanoExpress = await prisma.busCompany.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Volcano Express',
      contact: '+250788111222',
      description: 'Premium bus service connecting major cities in Rwanda',
      logoUrl: 'https://placehold.co/40x40.png',
      ownerId: busOperator1.id,
    },
  });

  const horizonExpress = await prisma.busCompany.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: 'Horizon Express',
      contact: '+250788333444',
      description: 'Affordable and reliable bus transportation',
      logoUrl: 'https://placehold.co/40x40.png',
      ownerId: busOperator2.id,
    },
  });

  const kigaliBusServices = await prisma.busCompany.upsert({
    where: { id: 3 },
    update: {},
    create: {
      name: 'Kigali Bus Services',
      contact: '+250788555666',
      description: 'Serving routes in and around Kigali',
      logoUrl: 'https://placehold.co/40x40.png',
    },
  });

  const virungaExpress = await prisma.busCompany.upsert({
    where: { id: 4 },
    update: {},
    create: {
      name: 'Virunga Express',
      contact: '+250788777888',
      description: 'Connecting northern Rwanda destinations',
      logoUrl: 'https://placehold.co/40x40.png',
    },
  });

  // Create buses
  const buses = [
    { plateNumber: 'RAD 001 A', capacity: 45, model: 'Yutong ZK6119H', companyId: volcanoExpress.id },
    { plateNumber: 'RAD 002 A', capacity: 40, model: 'Mercedes Travego', companyId: volcanoExpress.id },
    { plateNumber: 'RAD 003 B', capacity: 50, model: 'Scania K410', companyId: horizonExpress.id },
    { plateNumber: 'RAD 004 B', capacity: 35, model: 'Isuzu NPR', companyId: horizonExpress.id },
    { plateNumber: 'RAD 005 C', capacity: 42, model: 'MAN Lion', companyId: kigaliBusServices.id },
    { plateNumber: 'RAD 006 D', capacity: 38, model: 'Volvo 9700', companyId: virungaExpress.id },
  ];

  for (const busData of buses) {
    await prisma.bus.upsert({
      where: { plateNumber: busData.plateNumber },
      update: {},
      create: busData,
    });
  }

  // Create routes
  const routes = [
    { origin: 'Kigali', destination: 'Musanze', distance: 105, duration: 2.5, companyId: volcanoExpress.id },
    { origin: 'Kigali', destination: 'Huye', distance: 135, duration: 3, companyId: volcanoExpress.id },
    { origin: 'Kigali', destination: 'Rubavu', distance: 155, duration: 3.5, companyId: horizonExpress.id },
    { origin: 'Kigali', destination: 'Muhanga', distance: 50, duration: 1, companyId: horizonExpress.id },
    { origin: 'Kigali', destination: 'Rwamagana', distance: 55, duration: 1.2, companyId: kigaliBusServices.id },
    { origin: 'Musanze', destination: 'Rubavu', distance: 85, duration: 2, companyId: virungaExpress.id },
    { origin: 'Huye', destination: 'Nyamagabe', distance: 45, duration: 1, companyId: volcanoExpress.id },
  ];

  for (const routeData of routes) {
    await prisma.route.upsert({
      where: { 
        id: routes.indexOf(routeData) + 1
      },
      update: {},
      create: {
        ...routeData,
        id: routes.indexOf(routeData) + 1,
      },
    });
  }

  // Create schedules for today and next few days
  const today = new Date();
  const scheduleData = [];

  for (let day = 0; day < 7; day++) {
    const scheduleDate = new Date(today);
    scheduleDate.setDate(today.getDate() + day);
    
    // Morning schedules (6:00 - 12:00)
    const morningTimes = [
      { departure: '06:00', arrival: '08:30' },
      { departure: '08:00', arrival: '10:30' },
      { departure: '09:30', arrival: '12:00' },
      { departure: '11:00', arrival: '13:30' },
    ];

    // Afternoon schedules (13:00 - 18:00)
    const afternoonTimes = [
      { departure: '13:00', arrival: '15:30' },
      { departure: '14:00', arrival: '16:30' },
      { departure: '15:30', arrival: '18:00' },
      { departure: '17:00', arrival: '19:30' },
    ];

    const allTimes = [...morningTimes, ...afternoonTimes];

    // Create schedules for each route
    for (let i = 1; i <= routes.length; i++) {
      for (let j = 0; j < Math.min(allTimes.length, 4); j++) {
        const timeSlot = allTimes[j];
        const busIndex = ((i - 1) * 2 + j) % buses.length;
        
        const departure = new Date(scheduleDate);
        const [depHour, depMin] = timeSlot.departure.split(':').map(Number);
        departure.setHours(depHour, depMin, 0, 0);
        
        const arrival = new Date(scheduleDate);
        const [arrHour, arrMin] = timeSlot.arrival.split(':').map(Number);
        arrival.setHours(arrHour, arrMin, 0, 0);

        scheduleData.push({
          departure,
          arrival,
          price: 2500 + Math.floor(Math.random() * 2000), // Random price between 2500-4500
          availableSeats: Math.floor(Math.random() * 30) + 10, // Random seats between 10-40
          busId: busIndex + 1,
          routeId: i,
        });
      }
    }
  }

  // Insert schedules
  for (const schedule of scheduleData) {
    await prisma.schedule.create({
      data: schedule,
    });
  }

  console.log('Database seeding completed!');
  console.log(`Created ${scheduleData.length} schedules for the next 7 days`);
  console.log('Test accounts:');
  console.log('Admin: admin@itike.rw / admin123');
  console.log('Bus Operator 1: operator1@itike.rw / operator123');
  console.log('Bus Operator 2: operator2@itike.rw / operator123');
  console.log('Regular User: user@itike.rw / user123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

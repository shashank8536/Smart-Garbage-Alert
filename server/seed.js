const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Ward = require('./models/Ward');
const Complaint = require('./models/Complaint');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB for seeding');

    // Clear existing data
    await User.deleteMany({});
    await Ward.deleteMany({});
    await Complaint.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create users
    const citizen1 = await User.create({
      name: 'Rajesh Kumar',
      email: 'rajesh@citizen.com',
      password: 'password123',
      role: 'citizen',
      ward: 'Ward 12 - Sadar Bazaar',
      rewardPoints: 45,
    });

    const citizen2 = await User.create({
      name: 'Priya Sharma',
      email: 'priya@citizen.com',
      password: 'password123',
      role: 'citizen',
      ward: 'Ward 12 - Sadar Bazaar',
      rewardPoints: 30,
    });

    const officer = await User.create({
      name: 'Suresh Patel',
      email: 'suresh@municipal.com',
      password: 'password123',
      role: 'municipal',
      ward: 'Ward 12 - Sadar Bazaar',
    });

    console.log('👥 Users created:');
    console.log(`   Citizen 1: rajesh@citizen.com / password123`);
    console.log(`   Citizen 2: priya@citizen.com / password123`);
    console.log(`   Officer:   suresh@municipal.com / password123`);

    // Create ward
    const ward = await Ward.create({
      wardName: 'Ward 12 - Sadar Bazaar',
      wardNumber: 12,
      city: 'Agra',
      totalHouseholds: 100,
      municipalOfficerId: officer._id,
      alerts: [
        {
          message: 'Good morning, residents of Ward 12! 🌿 Your garbage collection vehicle will arrive at 8:00 AM today. Please keep your segregated waste bags ready at your doorstep. Together, let\'s keep Sadar Bazaar clean!',
          collectionTime: '8:00 AM',
          context: 'Morning collection round',
          createdAt: new Date(Date.now() - 86400000),
        },
      ],
    });

    // Create sample complaints
    const complaint1 = await Complaint.create({
      citizenId: citizen1._id,
      description: 'Large pile of garbage dumped near the main market entrance. It has been there for 3 days and is causing a foul smell. Stray animals are scattering the waste.',
      imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/garbage-alerts/sample1.jpg',
      location: {
        lat: 27.1767,
        lng: 78.0081,
        address: 'Near Main Market Gate, Sadar Bazaar, Agra',
      },
      severity: 'High',
      category: 'Open Dumping',
      aiSummary: 'Citizens report a significant illegal waste dumping incident near the main market area that has persisted for three days, creating health and hygiene concerns.',
      aiRecommendedAction: 'Immediately dispatch a cleanup crew to the market entrance. Install a waste collection bin and post no-dumping signage to prevent recurrence.',
      status: 'Pending',
      ward: 'Ward 12 - Sadar Bazaar',
      confirmations: [],
    });

    const complaint2 = await Complaint.create({
      citizenId: citizen2._id,
      description: 'The garbage collection truck did not come to our lane today. We had kept our waste ready since morning but no one came to collect it.',
      imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/garbage-alerts/sample2.jpg',
      location: {
        lat: 27.1790,
        lng: 78.0120,
        address: 'Lane 4, Gandhi Nagar, Sadar Bazaar',
      },
      severity: 'Medium',
      category: 'Missed Pickup',
      aiSummary: 'Resident reports a missed garbage collection in the Gandhi Nagar area, indicating a scheduling or route compliance issue.',
      aiRecommendedAction: 'Verify the collection route log for this area. Arrange an immediate pickup and ensure the route is followed consistently.',
      status: 'In Progress',
      ward: 'Ward 12 - Sadar Bazaar',
      confirmations: [citizen2._id],
    });

    const complaint3 = await Complaint.create({
      citizenId: citizen1._id,
      description: 'Community dustbin near the temple is overflowing. Garbage is spilling onto the road and blocking the footpath. Needs urgent attention.',
      imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/garbage-alerts/sample3.jpg',
      location: {
        lat: 27.1750,
        lng: 78.0050,
        address: 'Near Shiva Temple, Sadar Bazaar',
      },
      severity: 'High',
      category: 'Overflow',
      aiSummary: 'Community dustbin near a religious site has exceeded capacity, causing waste spillage onto the road and footpath, requiring urgent intervention.',
      aiRecommendedAction: 'Clear the overflowing dustbin immediately. Consider increasing the frequency of collection for this high-traffic location or replacing with a larger bin.',
      status: 'Pending',
      ward: 'Ward 12 - Sadar Bazaar',
      confirmations: [],
    });

    console.log('📋 Sample complaints created (3)');
    console.log('🏘️  Ward created: Ward 12 - Sadar Bazaar, Agra');
    console.log('');
    console.log('✅ Seed completed successfully!');
    console.log('');
    console.log('Test credentials:');
    console.log('─────────────────────────────────────');
    console.log('Citizen:    rajesh@citizen.com / password123');
    console.log('Citizen:    priya@citizen.com  / password123');
    console.log('Municipal:  suresh@municipal.com / password123');
    console.log('─────────────────────────────────────');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
};

seedData();

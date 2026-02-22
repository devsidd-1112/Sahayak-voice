/**
 * MongoDB Shell Script to Seed Test Data
 * 
 * Usage:
 * mongosh sahayak_voice scripts/seed-data.js
 * 
 * Or from MongoDB shell:
 * use sahayak_voice
 * load('scripts/seed-data.js')
 */

// Switch to the database
db = db.getSiblingDB('sahayak_voice');

print('🌱 Starting database seeding...\n');

// Clear existing data
print('Clearing existing data...');
db.users.deleteMany({});
db.visits.deleteMany({});
print('✓ Existing data cleared\n');

// BCrypt hashed password for "test123" (using BCrypt with strength 10)
// Generated using: BCryptPasswordEncoder().encode("test123")
const hashedPassword = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';

// Create test users
print('Creating test users...');

const user1 = {
    name: 'Priya Sharma',
    phoneNumber: '9876543210',
    hashedPassword: hashedPassword,
    createdAt: new Date()
};
const user1Result = db.users.insertOne(user1);
print(`✓ Created user: ${user1.name} (${user1.phoneNumber})`);

const user2 = {
    name: 'Sunita Devi',
    phoneNumber: '9876543211',
    hashedPassword: hashedPassword,
    createdAt: new Date()
};
db.users.insertOne(user2);
print(`✓ Created user: ${user2.name} (${user2.phoneNumber})`);

const user3 = {
    name: 'Radha Kumari',
    phoneNumber: '9876543212',
    hashedPassword: hashedPassword,
    createdAt: new Date()
};
db.users.insertOne(user3);
print(`✓ Created user: ${user3.name} (${user3.phoneNumber})\n`);

// Get the first user's ID for visit records
const firstUserId = user1Result.insertedId.toString();

// Create sample visit records
print('Creating sample visit records...');

const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
const twoDaysAgo = new Date(today);
twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
const threeDaysAgo = new Date(today);
threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
const fourDaysAgo = new Date(today);
fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);

const visits = [
    {
        userId: firstUserId,
        patientName: 'Sunita Devi',
        bloodPressure: '140/90',
        childSymptom: 'fever',
        visitDate: fourDaysAgo.toISOString().split('T')[0],
        createdAt: fourDaysAgo
    },
    {
        userId: firstUserId,
        patientName: 'Priya Sharma',
        bloodPressure: '120/80',
        childSymptom: 'cough',
        visitDate: threeDaysAgo.toISOString().split('T')[0],
        createdAt: threeDaysAgo
    },
    {
        userId: firstUserId,
        patientName: 'Radha Kumari',
        bloodPressure: '130/85',
        childSymptom: 'fever, cough',
        visitDate: twoDaysAgo.toISOString().split('T')[0],
        createdAt: twoDaysAgo
    },
    {
        userId: firstUserId,
        patientName: 'Meera Patel',
        bloodPressure: '125/82',
        childSymptom: 'diarrhea',
        visitDate: yesterday.toISOString().split('T')[0],
        createdAt: yesterday
    },
    {
        userId: firstUserId,
        patientName: 'Anjali Singh',
        bloodPressure: '135/88',
        childSymptom: null,
        visitDate: today.toISOString().split('T')[0],
        createdAt: today
    }
];

visits.forEach(visit => {
    db.visits.insertOne(visit);
    print(`✓ Created visit for ${visit.patientName} on ${visit.visitDate}`);
});

print('\n✅ Database seeded successfully!');
print('\n📝 Test Credentials:');
print('   Phone: 9876543210 | Password: test123 | Name: Priya Sharma');
print('   Phone: 9876543211 | Password: test123 | Name: Sunita Devi');
print('   Phone: 9876543212 | Password: test123 | Name: Radha Kumari');
print(`\n📊 Created 3 users and ${visits.length} visit records`);

// Create indexes
print('\n📑 Creating indexes...');
db.users.createIndex({ phoneNumber: 1 }, { unique: true });
db.visits.createIndex({ userId: 1 });
db.visits.createIndex({ createdAt: 1 });
print('✓ Indexes created');

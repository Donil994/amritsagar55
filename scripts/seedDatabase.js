const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Contact = require('../models/Contact');
const Booking = require('../models/Booking');

// Sample data
const sampleUsers = [
    {
        username: 'admin',
        email: 'admin@amritsagar.org',
        password: 'admin123',
        role: 'admin',
        profile: {
            firstName: 'Admin',
            lastName: 'User',
            phone: '+91 88875 33641',
            department: 'Administration'
        },
        permissions: [
            'view_contacts', 'manage_contacts',
            'view_bookings', 'manage_bookings',
            'view_analytics', 'manage_users',
            'manage_content', 'manage_settings'
        ],
        isActive: true
    },
    {
        username: 'staff',
        email: 'staff@amritsagar.org',
        password: 'staff123',
        role: 'staff',
        profile: {
            firstName: 'Staff',
            lastName: 'Member',
            phone: '+91 78972 52140',
            department: 'Operations'
        },
        permissions: [
            'view_contacts', 'manage_contacts',
            'view_bookings', 'manage_bookings'
        ],
        isActive: true
    }
];

const sampleContacts = [
    {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1 555-0101',
        subject: 'Inquiry about yoga retreat',
        message: 'I am interested in attending a yoga retreat at your ashram. Please provide more information about upcoming programs.',
        source: 'contact-form',
        status: 'resolved',
        priority: 'medium',
        notes: [{
            content: 'Called the customer, they are interested in the 7-day retreat program',
            author: 'Admin',
            timestamp: new Date()
        }]
    },
    {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        phone: '+1 555-0102',
        subject: 'Question about accommodation',
        message: 'What type of accommodation do you offer for long-term stays?',
        source: 'contact-form',
        status: 'pending',
        priority: 'low'
    }
];

const sampleBookings = [
    {
        personalInfo: {
            firstName: 'Michael',
            lastName: 'Johnson',
            email: 'michael.johnson@example.com',
            phone: '+1 555-0103',
            country: 'United States',
            emergencyContact: {
                name: 'Sarah Johnson',
                phone: '+1 555-0104',
                relationship: 'Spouse'
            }
        },
        program: {
            type: 'retreat',
            name: '7-Day Spiritual Retreat',
            duration: 7,
            startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            endDate: new Date(Date.now() + 37 * 24 * 60 * 60 * 1000), // 37 days from now
            participants: {
                adults: 2,
                children: 0
            },
            experience: 'beginner'
        },
        accommodation: {
            type: 'double',
            checkIn: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            checkOut: new Date(Date.now() + 37 * 24 * 60 * 60 * 1000)
        },
        payment: {
            status: 'paid',
            amount: 2100,
            currency: 'USD',
            method: 'online',
            transactionId: 'TXN123456789',
            paidAt: new Date()
        },
        status: 'confirmed',
        source: 'website',
        notes: [{
            content: 'Customer paid via credit card',
            author: 'System',
            timestamp: new Date()
        }]
    }
];

// Seed database
const seedDatabase = async () => {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/amrit-sagar');
        console.log('📊 Connected to MongoDB for seeding');

        // Clear existing data
        console.log('🗑️ Clearing existing data...');
        await User.deleteMany({});
        await Contact.deleteMany({});
        await Booking.deleteMany({});
        console.log('✅ Existing data cleared');

        // Insert sample users
        console.log('👤 Seeding users...');
        for (const userData of sampleUsers) {
            const user = new User(userData);
            await user.save();
            console.log(`✅ Created user: ${user.username}`);
        }

        // Insert sample contacts
        console.log('📧 Seeding contacts...');
        for (const contactData of sampleContacts) {
            const contact = new Contact(contactData);
            await contact.save();
            console.log(`✅ Created contact: ${contact.name}`);
        }

        // Insert sample bookings
        console.log('📅 Seeding bookings...');
        for (const bookingData of sampleBookings) {
            const booking = new Booking(bookingData);
            await booking.save();
            console.log(`✅ Created booking: ${booking.personalInfo.firstName} ${booking.personalInfo.lastName}`);
        }

        console.log('🎉 Database seeded successfully!');
        console.log(`
📊 Seeding Summary:
- Users: ${sampleUsers.length}
- Contacts: ${sampleContacts.length}
- Bookings: ${sampleBookings.length}

🔑 Login Credentials:
- Admin: admin / admin123
- Staff: staff / staff123
        `);

    } catch (error) {
        console.error('❌ Seeding error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
        process.exit(0);
    }
};

// Run seeding
if (require.main === module) {
    seedDatabase();
}

module.exports = seedDatabase;

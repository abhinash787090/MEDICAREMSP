const mongoose = require('mongoose');
const { Stat, Patient, Doctor, Appointment, Bed, Lab, Pharmacy, Billing } = require('./models');
require('dotenv').config();

const dbData = {
    stats: {
        patients: '1,248', admissions: '142', appointments: '38', revenue: '₹4,52,000'
    },
    patients: [
        { id: 'PT-1001', name: 'Rahul Sharma', age: 45, gender: 'M', phone: '+91 9876543210', status: 'Admitted', lastVisit: '2023-11-01', type: 'IPD', diagnosis: 'Dengue Fever' },
        { id: 'PT-1002', name: 'Sneha Patel', age: 32, gender: 'F', phone: '+91 9876543211', status: 'Discharged', lastVisit: '2023-10-25', type: 'OPD', diagnosis: 'Migraine' },
        { id: 'PT-1003', name: 'Amit Kumar', age: 58, gender: 'M', phone: '+91 9876543212', status: 'Consulting', lastVisit: '2023-11-05', type: 'OPD', diagnosis: 'Hypertension' },
        { id: 'PT-1004', name: 'Pooja Singh', age: 24, gender: 'F', phone: '+91 9876543213', status: 'Critical', lastVisit: '2023-11-04', type: 'ICU', diagnosis: 'Severe Asthma' },
    ],
    doctors: [
        { id: 'DR-001', name: 'Dr. Vivek Menon', specialty: 'Cardiology', department: 'Cardiology', patients: 12, status: 'Available' },
        { id: 'DR-002', name: 'Dr. Anjali Desai', specialty: 'Neurology', department: 'Neurology', patients: 8, status: 'In Surgery' },
        { id: 'DR-003', name: 'Dr. Rajesh Khanna', specialty: 'Orthopedics', department: 'Orthopaedics', patients: 15, status: 'On Leave' },
        { id: 'DR-004', name: 'Dr. Meera Vasudev', specialty: 'Pediatrics', department: 'Pediatrics', patients: 20, status: 'Available' }
    ],
    appointments: [
        { id: 'AP-501', patient: 'Rahul Sharma', doctor: 'Dr. Vivek Menon', date: 'Today', time: '10:30 AM', status: 'Completed' },
        { id: 'AP-502', patient: 'Ravi Teja', doctor: 'Dr. Anjali Desai', date: 'Today', time: '11:00 AM', status: 'Scheduled' },
        { id: 'AP-503', patient: 'Alia Bhatt', doctor: 'Dr. Meera Vasudev', date: 'Today', time: '12:15 PM', status: 'Waiting' },
        { id: 'AP-504', patient: 'Vikas Gupta', doctor: 'Dr. Rajesh Khanna', date: 'Tomorrow', time: '09:00 AM', status: 'Scheduled' }
    ],
    beds: [
        { room: 'ICU-1', bed: 'B-01', type: 'ICU', patient: 'Pooja Singh', status: 'Occupied' },
        { room: 'GEN-2', bed: 'B-12', type: 'General', patient: '-', status: 'Available' },
        { room: 'PRV-1', bed: 'B-03', type: 'Private', patient: 'Rahul Sharma', status: 'Occupied' },
        { room: 'GEN-2', bed: 'B-13', type: 'General', patient: '-', status: 'Maintenance' },
    ],
    labs: [
        { id: 'TR-801', patient: 'Amit Kumar', test: 'Complete Blood Count (CBC)', date: '2023-11-05', status: 'Pending' },
        { id: 'TR-802', patient: 'Sneha Patel', test: 'MRI Brain', date: '2023-11-04', status: 'Completed' },
        { id: 'TR-803', patient: 'Rahul Sharma', test: 'Dengue NS1 Antigen', date: '2023-11-01', status: 'Completed' }
    ],
    pharmacy: [
        { id: 'MED-101', name: 'Paracetamol 500mg', stock: 1250, batch: 'B782X', status: 'In Stock' },
        { id: 'MED-102', name: 'Amoxicillin 250mg', stock: 15, batch: 'B822Y', status: 'Low Stock' },
        { id: 'MED-103', name: 'Insulin Glargine', stock: 0, batch: 'B112Z', status: 'Out of Stock' }
    ],
    billing: [
        { invoice: 'INV-4401', patient: 'Amit Kumar', date: '2023-11-05', amount: '₹1,200', status: 'Paid' },
        { invoice: 'INV-4402', patient: 'Rahul Sharma', date: '2023-11-01', amount: '₹28,500', status: 'Pending' },
        { invoice: 'INV-4403', patient: 'Sneha Patel', date: '2023-10-25', amount: '₹8,500', status: 'Paid' }
    ]
};

async function seedDatabase() {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/medicare';
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        // Clear existing data
        await Stat.deleteMany();
        await Patient.deleteMany();
        await Doctor.deleteMany();
        await Appointment.deleteMany();
        await Bed.deleteMany();
        await Lab.deleteMany();
        await Pharmacy.deleteMany();
        await Billing.deleteMany();
        console.log('Cleared existing data');

        // Insert new data
        await Stat.create(dbData.stats);
        await Patient.insertMany(dbData.patients);
        await Doctor.insertMany(dbData.doctors);
        await Appointment.insertMany(dbData.appointments);
        await Bed.insertMany(dbData.beds);
        await Lab.insertMany(dbData.labs);
        await Pharmacy.insertMany(dbData.pharmacy);
        await Billing.insertMany(dbData.billing);

        console.log('Seed data inserted successfully!');
        process.exit();
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
}

seedDatabase();

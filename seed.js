const { Stat, Patient, Doctor, Appointment, Bed, Lab, Pharmacy, Billing, User } = require('./models');
const bcrypt = require('bcryptjs');

const dbData = {
    stats: {
        patients: '1,248', admissions: '142', appointments: '38', revenue: '₹4,52,000'
    },
    users: [
        { email: 'admin@medicare.com', password: 'admin123', name: 'Admin User', role: 'Admin' },
        { email: 'doctor@medicare.com', password: 'doctor123', name: 'Dr. Vivek Menon', role: 'Doctor' },
        { email: 'patient@medicare.com', password: 'patient123', name: 'Rahul Sharma', role: 'Patient' }
    ],
    patients: [
        { id: 'PT-1001', name: 'Rahul Sharma', age: 45, gender: 'M', phone: '+91 9876543210', status: 'Admitted', lastVisit: '2023-11-01', type: 'IPD', diagnosis: 'Dengue Fever' },
        { id: 'PT-1002', name: 'Sneha Patel', age: 32, gender: 'F', phone: '+91 9876543211', status: 'Discharged', lastVisit: '2023-10-25', type: 'OPD', diagnosis: 'Migraine' },
        { id: 'PT-1003', name: 'Amit Kumar', age: 58, gender: 'M', phone: '+91 9876543212', status: 'Consulting', lastVisit: '2023-11-05', type: 'OPD', diagnosis: 'Hypertension' },
        { id: 'PT-1004', name: 'Pooja Singh', age: 24, gender: 'F', phone: '+91 9876543213', status: 'Critical', lastVisit: '2023-11-04', type: 'ICU', diagnosis: 'Severe Asthma' },
    ],
    doctors: [
        {
            id: 'DR-001',
            name: 'Dr. Vivek Menon',
            firstName: 'Vivek',
            middleName: 'K.',
            lastName: 'Menon',
            dob: '1979-04-15',
            gender: 'Male',
            religion: 'Hindu',
            phone: '+91 9876543210',
            email: 'vivek.menon@medicare.com',
            address: '12 Green Street, Mumbai, India',
            clinicAddress: 'Apollo Heart Centre, Mumbai',
            clinicOpeningDate: '2017-02-15',
            degrees: 'MBBS, MD (Cardiology)',
            specialty: 'Cardiology',
            department: 'Cardiology',
            registrationNumber: 'MCI-123456',
            dailyPatients: 28,
            currentJob: 'Senior Cardiologist, Apollo Heart Centre',
            licenseNumber: 'LIC-789012',
            boardCertification: 'National Board of Echocardiography',
            professionalExperience: '15 years in interventional cardiology and heart failure management',
            certifications: 'ACLS, Echocardiography, Cath Lab Training',
            skillsInterests: 'Interventional Cardiology, Heart Failure, Preventive Medicine',
            familyMembers: 'Spouse: Nisha Menon; Children: Arya (10), Meera (7)',
            references: 'Dr. Suresh Rao; Dr. Ananya Bose',
            documents: 'resume.pdf, license.pdf, photo.jpg',
            patients: 12,
            status: 'Available'
        },
        {
            id: 'DR-002',
            name: 'Dr. Anjali Desai',
            firstName: 'Anjali',
            middleName: '',
            lastName: 'Desai',
            dob: '1984-06-22',
            gender: 'Female',
            religion: 'Jain',
            phone: '+91 9876543211',
            email: 'anjali.desai@medicare.com',
            address: '28 Lotus Avenue, Pune, India',
            clinicAddress: 'Neurocare Clinic, Pune',
            clinicOpeningDate: '2019-07-03',
            degrees: 'MBBS, MD (Neurology)',
            specialty: 'Neurology',
            department: 'Neurology',
            registrationNumber: 'MCI-234567',
            dailyPatients: 22,
            currentJob: 'Consultant Neurologist, Neurocare Clinic',
            licenseNumber: 'LIC-890123',
            boardCertification: 'Board Certified in Clinical Neurophysiology',
            professionalExperience: '12 years in stroke and epilepsy care',
            certifications: 'EEG Interpretation, Stroke Rehabilitation',
            skillsInterests: 'Neurocritical Care, Epilepsy, Cognitive Disorders',
            familyMembers: 'Spouse: Raj Desai; Children: Arjun (6)',
            references: 'Dr. Priya Nair; Dr. Shailesh Patel',
            documents: 'resume.pdf, license.pdf, photo.jpg',
            patients: 8,
            status: 'In Surgery'
        },
        {
            id: 'DR-003',
            name: 'Dr. Rajesh Khanna',
            firstName: 'Rajesh',
            middleName: '',
            lastName: 'Khanna',
            dob: '1975-02-10',
            gender: 'Male',
            religion: 'Sikh',
            phone: '+91 9876543212',
            email: 'rajesh.khanna@medicare.com',
            address: '55 Sunrise Blvd, Delhi, India',
            clinicAddress: 'Orthoflex Centre, Delhi',
            clinicOpeningDate: '2015-09-10',
            degrees: 'MBBS, MS (Orthopedics)',
            specialty: 'Orthopedics',
            department: 'Orthopaedics',
            registrationNumber: 'MCI-345678',
            dailyPatients: 35,
            currentJob: 'Head of Orthopedics, Orthoflex Centre',
            licenseNumber: 'LIC-901234',
            boardCertification: 'Orthopedic Surgery Board',
            professionalExperience: '18 years treating joint replacement and sports injuries',
            certifications: 'Arthroscopy, Joint Replacement Techniques',
            skillsInterests: 'Sports Medicine, Spine Surgery, Joint Preservation',
            familyMembers: 'Spouse: Priya Khanna; Children: Karan (14), Neha (11)',
            references: 'Dr. Manish Verma; Dr. Lata Iyer',
            documents: 'resume.pdf, license.pdf, photo.jpg',
            patients: 15,
            status: 'On Leave'
        },
        {
            id: 'DR-004',
            name: 'Dr. Meera Vasudev',
            firstName: 'Meera',
            middleName: '',
            lastName: 'Vasudev',
            dob: '1988-11-03',
            gender: 'Female',
            religion: 'Christian',
            phone: '+91 9876543213',
            email: 'meera.vasudev@medicare.com',
            address: '17 Blossom Street, Bangalore, India',
            clinicAddress: 'Little Hearts Clinic, Bangalore',
            clinicOpeningDate: '2021-01-12',
            degrees: 'MBBS, DCH',
            specialty: 'Pediatrics',
            department: 'Pediatrics',
            registrationNumber: 'MCI-456789',
            dailyPatients: 30,
            currentJob: 'Pediatrician, Little Hearts Clinic',
            licenseNumber: 'LIC-012345',
            boardCertification: 'Pediatric Advanced Life Support',
            professionalExperience: '10 years in pediatric care and newborn wellness',
            certifications: 'PALS, Child Nutrition',
            skillsInterests: 'Pediatric Infectious Diseases, Child Development',
            familyMembers: 'Spouse: Arun Vasudev; Children: Neel (4)',
            references: 'Dr. Kavita Sharma; Dr. Ajay Rao',
            documents: 'resume.pdf, license.pdf, photo.jpg',
            patients: 20,
            status: 'Available'
        }
    ],
    appointments: [
        { id: 'AP-501', patient: 'Rahul Sharma', email: 'rahul@email.com', phone: '+91 9876543210', age: '45', address: 'Mumbai', doctor: 'Dr. Vivek Menon', specialty: 'Cardiology', date: 'Today', time: '10:30 AM', reason: 'Cardiac check-up', emergencyContact: 'Sharma', emergencyContactPhone: '+91 9876543210', status: 'Completed' },
        { id: 'AP-502', patient: 'Ravi Teja', email: 'ravi@email.com', phone: '+91 9876543211', age: '32', address: 'Delhi', doctor: 'Dr. Anjali Desai', specialty: 'Neurology', date: 'Today', time: '11:00 AM', reason: 'Neurological consultation', emergencyContact: 'Nisha', emergencyContactPhone: '+91 9876543211', status: 'Scheduled' },
        { id: 'AP-503', patient: 'Alia Bhatt', email: 'alia@email.com', phone: '+91 9876543212', age: '28', address: 'Bangalore', doctor: 'Dr. Meera Vasudev', specialty: 'Orthopedics', date: 'Today', time: '12:15 PM', reason: 'Knee pain', emergencyContact: 'Bhatt', emergencyContactPhone: '+91 9876543212', status: 'Waiting' },
        { id: 'AP-504', patient: 'Vikas Gupta', email: 'vikas@email.com', phone: '+91 9876543213', age: '55', address: 'Pune', doctor: 'Dr. Rajesh Khanna', specialty: 'General Practice', date: 'Tomorrow', time: '09:00 AM', reason: 'General checkup', emergencyContact: 'Gupta', emergencyContactPhone: '+91 9876543213', status: 'Scheduled' }
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
        // Clear existing data
        await Stat.destroy({ where: {} });
        await Patient.destroy({ where: {} });
        await Doctor.destroy({ where: {} });
        await Appointment.destroy({ where: {} });
        await Bed.destroy({ where: {} });
        await Lab.destroy({ where: {} });
        await Pharmacy.destroy({ where: {} });
        await Billing.destroy({ where: {} });
        await User.destroy({ where: {} });
        console.log('Cleared existing data');

        // Hash passwords and insert users
        const hashedUsers = await Promise.all(dbData.users.map(async (user) => ({
            ...user,
            password: await bcrypt.hash(user.password, 10)
        })));
        await User.bulkCreate(hashedUsers);

        // Insert new data
        await Stat.create(dbData.stats);
        await Patient.bulkCreate(dbData.patients);
        await Doctor.bulkCreate(dbData.doctors);
        await Appointment.bulkCreate(dbData.appointments);
        await Bed.bulkCreate(dbData.beds);
        await Lab.bulkCreate(dbData.labs);
        await Pharmacy.bulkCreate(dbData.pharmacy);
        await Billing.bulkCreate(dbData.billing);

        console.log('Seed data inserted successfully!');
    } catch (error) {
        console.error('Error seeding data:', error);
        throw error;
    }
}

module.exports = { seedDatabase };

// If run directly
if (require.main === module) {
    seedDatabase().then(() => process.exit()).catch(() => process.exit(1));
}

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const { Stat, Patient, Doctor, Appointment, Bed, Lab, Pharmacy, Billing } = require('./models');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/medicare';
mongoose.connect(mongoUri)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Error connecting to MongoDB:', err));

// API Endpoints
app.get('/api/data', async (req, res) => {
    try {
        const statsArray = await Stat.find();
        const stats = statsArray.length > 0 ? statsArray[0] : {}; // Getting the single stats object

        const patients = await Patient.find({}, '-_id -__v');
        const doctors = await Doctor.find({}, '-_id -__v');
        const appointments = await Appointment.find({}, '-_id -__v');
        const beds = await Bed.find({}, '-_id -__v');
        const labs = await Lab.find({}, '-_id -__v');
        const pharmacy = await Pharmacy.find({}, '-_id -__v');
        const billing = await Billing.find({}, '-_id -__v');

        const navConfig = [
            { id: 'dashboard', label: 'Dashboard', icon: 'ph-squares-four', roles: ['Admin', 'Doctor', 'Receptionist', 'Nurse', 'Lab Technician', 'Pharmacist', 'Patient'] },
            { id: 'patients', label: 'Patients', icon: 'ph-users', roles: ['Admin', 'Doctor', 'Receptionist', 'Nurse'] },
            { id: 'doctors', label: 'Doctors', icon: 'ph-stethoscope', roles: ['Admin', 'Receptionist', 'Patient'] },
            { id: 'appointments', label: 'Appointments', icon: 'ph-calendar-plus', roles: ['Admin', 'Doctor', 'Receptionist', 'Patient'] },
            { id: 'beds', label: 'Bed Management', icon: 'ph-bed', roles: ['Admin', 'Nurse', 'Receptionist'] },
            { id: 'emr', label: 'EMR Records', icon: 'ph-file-text', roles: ['Admin', 'Doctor', 'Nurse'] },
            { id: 'labs', label: 'Laboratories', icon: 'ph-microscope', roles: ['Admin', 'Lab Technician', 'Doctor', 'Patient'] },
            { id: 'pharmacy', label: 'Pharmacy', icon: 'ph-pill', roles: ['Admin', 'Pharmacist', 'Doctor'] },
            { id: 'billing', label: 'Billing', icon: 'ph-receipt', roles: ['Admin', 'Receptionist', 'Patient'] }
        ];

        const db = {
            roles: ['Admin', 'Doctor', 'Receptionist', 'Nurse', 'Lab Technician', 'Pharmacist', 'Patient'],
            currentUserRole: 'Admin',
            stats,
            patients,
            doctors,
            appointments,
            beds,
            labs,
            pharmacy,
            billing,
            navConfig
        };

        res.json(db);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

const mongoose = require('mongoose');

const statSchema = new mongoose.Schema({
    patients: String,
    admissions: String,
    appointments: String,
    revenue: String
});

const patientSchema = new mongoose.Schema({
    id: String,
    name: String,
    age: Number,
    gender: String,
    phone: String,
    status: String,
    lastVisit: String,
    type: String,
    diagnosis: String
});

const doctorSchema = new mongoose.Schema({
    id: String,
    name: String,
    specialty: String,
    department: String,
    patients: Number,
    status: String
});

const appointmentSchema = new mongoose.Schema({
    id: String,
    patient: String,
    doctor: String,
    date: String,
    time: String,
    status: String
});

const bedSchema = new mongoose.Schema({
    room: String,
    bed: String,
    type: String,
    patient: String,
    status: String
});

const labSchema = new mongoose.Schema({
    id: String,
    patient: String,
    test: String,
    date: String,
    status: String
});

const pharmacySchema = new mongoose.Schema({
    id: String,
    name: String,
    stock: Number,
    batch: String,
    status: String
});

const billingSchema = new mongoose.Schema({
    invoice: String,
    patient: String,
    date: String,
    amount: String,
    status: String
});

module.exports = {
    Stat: mongoose.model('Stat', statSchema),
    Patient: mongoose.model('Patient', patientSchema),
    Doctor: mongoose.model('Doctor', doctorSchema),
    Appointment: mongoose.model('Appointment', appointmentSchema),
    Bed: mongoose.model('Bed', bedSchema),
    Lab: mongoose.model('Lab', labSchema),
    Pharmacy: mongoose.model('Pharmacy', pharmacySchema),
    Billing: mongoose.model('Billing', billingSchema)
};

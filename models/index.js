const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

// Initialize Sequelize with SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '..', 'database.sqlite'),
    logging: console.log // Enable SQL logging for debugging
});

// Define models
const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: true },
    name: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.STRING, allowNull: false },
    otp: { type: DataTypes.STRING, allowNull: true },
    otpExpiry: { type: DataTypes.DATE, allowNull: true },
    isVerified: { type: DataTypes.BOOLEAN, defaultValue: false }
});

const Stat = sequelize.define('Stat', {
    patients: DataTypes.STRING,
    admissions: DataTypes.STRING,
    appointments: DataTypes.STRING,
    revenue: DataTypes.STRING
});

const Patient = sequelize.define('Patient', {
    id: { type: DataTypes.STRING, allowNull: false, unique: true, primaryKey: true },
    name: DataTypes.STRING,
    age: DataTypes.INTEGER,
    gender: DataTypes.STRING,
    phone: DataTypes.STRING,
    status: DataTypes.STRING,
    lastVisit: DataTypes.STRING,
    type: DataTypes.STRING,
    diagnosis: DataTypes.STRING,
    previousReport: DataTypes.TEXT
});

const Doctor = sequelize.define('Doctor', {
    id: { type: DataTypes.STRING, allowNull: false, unique: true, primaryKey: true },
    name: DataTypes.STRING,
    firstName: DataTypes.STRING,
    middleName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    dob: DataTypes.STRING,
    gender: DataTypes.STRING,
    religion: DataTypes.STRING,
    phone: DataTypes.STRING,
    email: DataTypes.STRING,
    address: DataTypes.TEXT,
    clinicAddress: DataTypes.TEXT,
    clinicOpeningDate: DataTypes.STRING,
    degrees: DataTypes.STRING,
    specialty: DataTypes.STRING,
    department: DataTypes.STRING,
    registrationNumber: DataTypes.STRING,
    dailyPatients: DataTypes.INTEGER,
    currentJob: DataTypes.STRING,
    licenseNumber: DataTypes.STRING,
    boardCertification: DataTypes.STRING,
    professionalExperience: DataTypes.TEXT,
    certifications: DataTypes.STRING,
    skillsInterests: DataTypes.STRING,
    familyMembers: DataTypes.TEXT,
    references: DataTypes.TEXT,
    documents: DataTypes.STRING,
    photo: DataTypes.TEXT,
    photoName: DataTypes.STRING,
    resume: DataTypes.TEXT,
    resumeName: DataTypes.STRING,
    patients: DataTypes.INTEGER,
    status: DataTypes.STRING
});

const Appointment = sequelize.define('Appointment', {
    id: { type: DataTypes.STRING, allowNull: false, unique: true, primaryKey: true },
    patient: DataTypes.STRING,
    email: DataTypes.STRING,
    phone: DataTypes.STRING,
    age: DataTypes.STRING,
    address: DataTypes.TEXT,
    doctor: DataTypes.STRING,
    specialty: DataTypes.STRING,
    date: DataTypes.STRING,
    time: DataTypes.STRING,
    reason: DataTypes.TEXT,
    insuranceProvider: DataTypes.STRING,
    insurancePolicyNumber: DataTypes.STRING,
    currentMedications: DataTypes.TEXT,
    allergies: DataTypes.TEXT,
    emergencyContact: DataTypes.STRING,
    emergencyContactPhone: DataTypes.STRING,
    status: DataTypes.STRING
});

const Bed = sequelize.define('Bed', {
    room: DataTypes.STRING,
    bed: DataTypes.STRING,
    type: DataTypes.STRING,
    patient: DataTypes.STRING,
    status: DataTypes.STRING
});

const Lab = sequelize.define('Lab', {
    id: { type: DataTypes.STRING, allowNull: false, unique: true, primaryKey: true },
    patientId: DataTypes.STRING,
    patient: DataTypes.STRING,
    age: DataTypes.INTEGER,
    gender: DataTypes.STRING,
    phone: DataTypes.STRING,
    email: DataTypes.STRING,
    address: DataTypes.TEXT,
    test: DataTypes.STRING,
    date: DataTypes.STRING,
    status: DataTypes.STRING,
    reportFile: DataTypes.TEXT,
    resultText: DataTypes.TEXT
});

const Pharmacy = sequelize.define('Pharmacy', {
    id: { type: DataTypes.STRING, allowNull: false, unique: true, primaryKey: true },
    name: DataTypes.STRING,
    category: DataTypes.STRING,
    brand: DataTypes.STRING,
    manufacturer: DataTypes.STRING,
    unit: DataTypes.STRING,
    stock: DataTypes.INTEGER,
    batch: DataTypes.STRING,
    manufacturingDate: DataTypes.STRING,
    expiryDate: DataTypes.STRING,
    status: DataTypes.STRING
});

const Billing = sequelize.define('Billing', {
    invoice: { type: DataTypes.STRING, allowNull: false, unique: true, primaryKey: true },
    patientId: DataTypes.STRING,
    patient: DataTypes.STRING,
    date: DataTypes.STRING,
    items: DataTypes.TEXT, // Store JSON string of line items
    subtotal: DataTypes.FLOAT,
    tax: DataTypes.FLOAT,
    discount: DataTypes.FLOAT,
    amount: DataTypes.STRING, // Total amount as string for display
    totalAmount: DataTypes.FLOAT, // Numeric total for stats
    paymentMethod: DataTypes.STRING,
    status: DataTypes.STRING
});

const Message = sequelize.define('Message', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    senderId: { type: DataTypes.INTEGER, allowNull: false },
    senderName: { type: DataTypes.STRING, allowNull: false },
    receiverId: { type: DataTypes.INTEGER, allowNull: false },
    receiverName: { type: DataTypes.STRING, allowNull: false },
    subject: { type: DataTypes.STRING, allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
    isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
    date: { type: DataTypes.STRING, defaultValue: () => new Date().toISOString() }
});

module.exports = { sequelize, User, Stat, Patient, Doctor, Appointment, Bed, Lab, Pharmacy, Billing, Message };

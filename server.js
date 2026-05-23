require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize, User, Stat, Patient, Doctor, Appointment, Bed, Lab, Pharmacy, Billing, Message } = require('./models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const JWT_SECRET = process.env.JWT_SECRET || 'your_fallback_super_secret_key_123';

// Pretty Console Logging for OTPs
function logOTP(email, otp, type = 'LOGIN') {
    const border = '========================================';
    const padding = ' '.repeat(Math.max(0, (border.length - otp.length - 12) / 2));
    console.log(`\n\n${border}`);
    console.log(`||  ${type} OTP FOR: ${email.padEnd(border.length - 19)} ||`);
    console.log(`|| ${' '.repeat(border.length - 6)} ||`);
    console.log(`||  YOUR CODE IS: ${otp.padEnd(border.length - 18)}  ||`);
    console.log(`${border}\n\n`);
}

// Nodemailer setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    logger: true,
    debug: true,
    pool: true,
    connectionTimeout: 60000,
    greetingTimeout: 60000,
    socketTimeout: 60000
});

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Global error handlers for debugging
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});


// Serve static files
app.use(express.static('.'));

// Sync database and seed if needed
async function initializeDatabase() {
    try {
        await sequelize.sync();
        console.log('Database synced successfully');
        
        // Check if users exist, if not, seed the database
        const userCount = await User.count();
        console.log(`Found ${userCount} users in database`);
        if (userCount === 0) {
            console.log('No users found, seeding database...');
            const seed = require('./seed');
            await seed.seedDatabase();
        }
    } catch (err) {
        console.error('Error initializing database:', err);
        process.exit(1);
    }
}

// Authentication Routes
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, name, role } = req.body;
        if (!email || !name || !role) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        const existingUser = await User.findOne({ where: { email } });
        
        if (existingUser && existingUser.isVerified) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 5 * 60000); // 5 minutes

        let user = existingUser;
        if (user) {
            user.name = name;
            user.role = role;
            user.otp = otp;
            user.otpExpiry = otpExpiry;
        } else {
            user = await User.build({ email, name, role, otp, otpExpiry, isVerified: false, password: 'OTP_LOGIN_ONLY' });
        }
        await user.save();

        // Send email
        // Prepare email
        const mailOptions = {
            from: `"MediCare Support" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Verify Your MediCare Account',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; max-width: 500px;">
                    <h2 style="color: #6366f1;">Welcome to MediCare!</h2>
                    <p>Hello <strong>${name}</strong>,</p>
                    <p>Please use the following OTP to verify your account and complete your registration:</p>
                    <div style="font-size: 24px; font-weight: bold; color: #1e293b; background: #f1f5f9; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
                        ${otp}
                    </div>
                    <p style="color: #64748b; font-size: 14px;">This OTP is valid for the next 5 minutes. If you did not sign up for MediCare, please ignore this email.</p>
                </div>
            `
        };

        // Send email (Asynchronously, don't block the response)
        transporter.sendMail(mailOptions).catch(err => {
            console.error('Signup Mail Send Error (will use terminal fallback):', err.message);
        });
        
        logOTP(email, otp, 'SIGNUP');
        res.status(200).json({ 
            message: 'Verification initiated.', 
            emailPreview: email 
        });
    } catch (error) {
        console.error('Registration error stack:', error.stack || error);
        res.status(500).json({ error: 'Registration failed', details: error.message });
    }
});

app.post('/api/auth/register-verify', async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });

        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        if (user.otp !== otp) return res.status(401).json({ error: 'Invalid OTP' });
        if (new Date() > new Date(user.otpExpiry)) return res.status(401).json({ error: 'OTP has expired' });

        user.isVerified = true;
        user.otp = null;
        user.otpExpiry = null;
        await user.save();

        const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, role: user.role, name: user.name, message: 'Account verified successfully!' });
    } catch (error) {
        console.error('Registration verification error:', error);
        res.status(500).json({ error: 'Verification failed' });
    }
});


app.post('/api/auth/login-step1', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        if (!user.isVerified) {
            return res.status(403).json({ error: 'Please verify your email before logging in.' });
        }

        const isMatch = await bcrypt.compare(password || '', user.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

        // Password is correct, now generate and send OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 5 * 60000); // 5 minutes

        user.otp = otp;
        user.otpExpiry = otpExpiry;
        await user.save();

        // Send email
        const mailOptions = {
            from: `"MediCare Support" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Login Verification Code',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; max-width: 500px;">
                    <h2 style="color: #f59e0b;">Security Check</h2>
                    <p>Hello <strong>${user.name}</strong>,</p>
                    <p>Your password was verified successfully. Please use this One-Time Password (OTP) to complete your login:</p>
                    <div style="font-size: 28px; font-weight: bold; color: #030712; background: #fef3c7; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; border: 1px solid #f59e0b;">
                        ${otp}
                    </div>
                    <p style="color: #64748b; font-size: 14px;">This code is valid for 5 minutes. If you did not attempt to login, please change your password immediately.</p>
                </div>
            `
        };

        transporter.sendMail(mailOptions).catch(err => {
            console.error('Mail Send Error (will use terminal fallback):', err.message);
        });

        logOTP(email, otp, 'LOGIN-STEP1');
        res.json({ message: 'Password verified. OTP sent to your email.' });
    } catch (error) {
        console.error('Login Step 1 error:', error);
        res.status(500).json({ error: 'Authentication failed', details: error.message });
    }
});

app.post('/api/auth/send-otp', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'Email is required' });

        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 5 * 60000); // 5 minutes

        user.otp = otp;
        user.otpExpiry = otpExpiry;
        await user.save();

        console.log(`[OTP DEBUG] OTP for ${email} is: ${otp}`);

        // Send email
        const mailOptions = {
            from: `"MediCare Support" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Your MediCare Login OTP',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; max-width: 500px;">
                    <h2 style="color: #6366f1;">MediCare Authentication</h2>
                    <p>Hello <strong>${user.name}</strong>,</p>
                    <p>Your One-Time Password (OTP) for logging into MediCare is:</p>
                    <div style="font-size: 24px; font-weight: bold; color: #1e293b; background: #f1f5f9; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
                        ${otp}
                    </div>
                    <p style="color: #64748b; font-size: 14px;">This OTP is valid for the next 5 minutes. Please do not share this code with anyone.</p>
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                    <p style="font-size: 12px; color: #94a3b8;">If you did not request this, please ignore this email.</p>
                </div>
            `
        };

        // Send email (Asynchronously)
        transporter.sendMail(mailOptions).catch(err => {
            console.error('Login Mail Send Error (will use terminal fallback):', err.message);
        });

        logOTP(email, otp, 'LOGIN');
        res.json({ message: 'OTP security check initiated.' });
    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({ error: 'Failed to send OTP', details: error.message });
    }
});

app.post('/api/auth/login-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });

        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        if (!user.otp || user.otp !== otp) {
            return res.status(401).json({ error: 'Invalid OTP' });
        }

        if (new Date() > new Date(user.otpExpiry)) {
            return res.status(401).json({ error: 'OTP has expired' });
        }

        // Clear OTP after successful login
        user.otp = null;
        user.otpExpiry = null;
        await user.save();

        const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, role: user.role, name: user.name, id: user.id });
    } catch (error) {
        console.error('OTP Login error:', error);
        res.status(500).json({ error: 'Login failed', details: error.message });
    }
});

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
    const bearerHeader = req.headers['authorization'];
    if (!bearerHeader) return res.status(401).json({ error: 'Access denied' });

    const token = bearerHeader.split(' ')[1];
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Invalid token' });
        req.user = decoded;
        next();
    });
};

// API Endpoints
app.post('/api/patients', verifyToken, async (req, res) => {
    try {
        console.log('Incoming Patient Data:', req.body);
        const { name, age, gender, cause, previousReport } = req.body;
        
        if (!name || !age || !gender || !cause) {
            return res.status(400).json({ error: 'Name, Age, Gender, and Cause are required fields.' });
        }

        const newId = `PT-${Date.now()}`;
        const newPatient = await Patient.create({
            id: newId,
            name,
            age: parseInt(age),
            gender,
            diagnosis: cause,
            previousReport,
            status: 'Admitted',
            type: 'Inpatient',
            lastVisit: new Date().toISOString().split('T')[0]
        });
        res.status(201).json(newPatient.toJSON());
    } catch (error) {
        console.error('Error adding patient:', error);
        res.status(500).json({ error: 'Failed to add patient', details: error.message });
    }
});

app.post('/api/doctors', verifyToken, async (req, res) => {
    try {
        console.log('Incoming Doctor Data:', { ...req.body, photo: req.body.photo ? '[ATTACHED]' : '[NONE]', resume: req.body.resume ? '[ATTACHED]' : '[NONE]' });
        const {
            name, dob, gender, religion, phone, email, address, clinicAddress, clinicOpeningDate,
            degrees, specialty, department, registrationNumber, dailyPatients, currentJob,
            licenseNumber, boardCertification, professionalExperience, certifications,
            skillsInterests, familyMembers, references, documents, photo, photoName,
            resume, resumeName, status
        } = req.body;

        if (!name || !gender || !phone || !email || !specialty) {
            return res.status(400).json({ error: 'Basic details (Name, Gender, Phone, Email, Specialty) are required.' });
        }

        const newId = `DR-${Date.now()}`;
        const newDoctor = await Doctor.create({
            id: newId,
            name, dob, gender, religion, phone, email, address, clinicAddress, clinicOpeningDate,
            degrees, specialty, department, registrationNumber, dailyPatients: dailyPatients ? Number(dailyPatients) : 0,
            currentJob, licenseNumber, boardCertification, professionalExperience, certifications,
            skillsInterests, familyMembers, references, documents, photo, photoName,
            resume, resumeName, status, patients: 0
        });
        console.log('Doctor created successfully:', newDoctor.id);
        res.status(201).json(newDoctor.toJSON());
    } catch (error) {
        console.error('Error adding doctor:', error);
        res.status(500).json({ error: 'Failed to add doctor', details: error.message });
    }
});

app.post('/api/appointments', verifyToken, async (req, res) => {
    try {
        const { patient, email, phone, age, address, doctor, specialty, date, time, reason, emergencyContact, emergencyContactPhone } = req.body;

        const newId = `AP-${Date.now()}`;
        const newAppointment = await Appointment.create({
            id: newId,
            patient,
            email,
            phone,
            age,
            address,
            doctor,
            specialty,
            date,
            time,
            reason,
            emergencyContact,
            emergencyContactPhone,
            status: 'Scheduled'
        });
        res.status(201).json(newAppointment.toJSON());
    } catch (error) {
        console.error('Error adding appointment:', error);
        res.status(500).json({ error: 'Failed to add appointment' });
    }
});

app.put('/api/beds/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { patient, status } = req.body;
        
        const bed = await Bed.findByPk(id);
        if (!bed) return res.status(404).json({ error: 'Bed not found' });
        
        bed.patient = patient;
        bed.status = status;
        await bed.save();
        
        res.json(bed.toJSON());
    } catch (error) {
        console.error('Error updating bed:', error);
        res.status(500).json({ error: 'Failed to update bed' });
    }
});

app.post('/api/labs', verifyToken, async (req, res) => {
    try {
        console.log(`Incoming Lab Request for patientId: ${req.body.patientId}, test: ${req.body.test}`);
        const { patient, age, gender, phone, email, address, patientId, test, date, status, reportFile, resultText } = req.body;
        
        if (!patientId || !test) {
            return res.status(400).json({ error: 'Patient ID and Test Type are required fields.' });
        }

        const newId = `LB-${Date.now()}`;
        
        // Auto-generate patientId if not provided (though frontend should send it)
        const sysPatientId = patientId || `PT-${Math.floor(Math.random() * 9000) + 1000}`;

        const newLab = await Lab.create({
            id: newId,
            patientId: sysPatientId,
            patient: patient || 'Unknown Patient',
            age: (age && age.trim() !== "") ? parseInt(age) : null,
            gender: gender || 'N/A',
            phone: phone || 'N/A',
            email: email || 'N/A',
            address: address || 'N/A',
            test,
            date: date || new Date().toISOString().split('T')[0],
            status: status || 'Pending',
            reportFile,
            resultText: resultText || ''
        });
        
        console.log('Lab record created successfully:', newLab.id);
        res.status(201).json(newLab.toJSON());
    } catch (error) {
        console.error('CRITICAL SERVER ERROR (POST /api/labs):', error);
        res.status(500).json({ error: 'Failed to add lab test', details: error.message });
    }
});

app.put('/api/labs/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const lab = await Lab.findByPk(id);
        if (!lab) return res.status(404).json({ error: 'Lab test not found' });
        
        lab.status = status;
        await lab.save();
        
        res.json(lab.toJSON());
    } catch (error) {
        console.error('Error updating lab status:', error);
        res.status(500).json({ error: 'Failed to update lab status' });
    }
});

app.post('/api/pharmacy', verifyToken, async (req, res) => {
    try {
        const { name, category, brand, manufacturer, unit, stock, batch, manufacturingDate, expiryDate, status } = req.body;
        const newId = `MED-${Date.now()}`;
        
        const newPharmacy = await Pharmacy.create({
            id: newId,
            name,
            category,
            brand,
            manufacturer,
            unit,
            stock: stock || 0,
            batch,
            manufacturingDate,
            expiryDate,
            status: status || 'In Stock'
        });
        
        res.status(201).json(newPharmacy.toJSON());
    } catch (error) {
        console.error('Error adding pharmacy stock:', error);
        res.status(500).json({ error: 'Failed to add pharmacy stock' });
    }
});

app.post('/api/billing', verifyToken, async (req, res) => {
    try {
        console.log('Incoming Billing Request:', JSON.stringify(req.body, null, 2));
        const { patientId, patient, date, items, subtotal, tax, discount, totalAmount, paymentMethod, status } = req.body;
        
        if (!patientId || totalAmount === undefined) {
            return res.status(400).json({ error: 'Patient selection and Total Amount are required.' });
        }

        const invoiceNo = `INV-${Date.now()}`;
        
        const newBilling = await Billing.create({
            invoice: invoiceNo,
            patientId,
            patient: patient === "Select a patient" ? "Walk-in Patient" : patient,
            date: date || new Date().toISOString().split('T')[0],
            items: typeof items === 'string' ? items : JSON.stringify(items || []),
            subtotal: parseFloat(subtotal) || 0,
            tax: parseFloat(tax) || 0,
            discount: parseFloat(discount) || 0,
            amount: `${(parseFloat(totalAmount) || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })} INR`,
            totalAmount: parseFloat(totalAmount) || 0,
            paymentMethod: paymentMethod || 'Cash',
            status: status || 'Paid'
        });

        // Update global revenue stat if the status is 'Paid'
        if (status === 'Paid') {
            let stats = await Stat.findAll();
            let currentStat;
            
            if (stats.length === 0) {
                currentStat = await Stat.create({ patients: '0', admissions: '0', appointments: '0', revenue: '0' });
            } else {
                currentStat = stats[0];
            }

            const cleanRevenue = (currentStat.revenue || "0").toString().replace(/[^0-9.]/g, '');
            const currentRevenue = parseFloat(cleanRevenue || 0);
            const newRevenue = currentRevenue + (parseFloat(totalAmount) || 0);
            
            currentStat.revenue = `${newRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })} INR`;
            await currentStat.save();
            console.log('Revenue updated successfully:', currentStat.revenue);
        }
        
        res.status(201).json(newBilling.toJSON());
    } catch (error) {
        console.error('CRITICAL SERVER ERROR (POST /api/billing):', error);
        res.status(500).json({ 
            error: 'Server failed to save billing record', 
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
        });
    }
});

app.get('/api/data', verifyToken, async (req, res) => {
    try {
        const statsArray = await Stat.findAll();
        const stats = statsArray.length > 0 ? statsArray[0].toJSON() : {};

        const patients = await Patient.findAll({ raw: true });
        const doctors = await Doctor.findAll({ raw: true });
        const appointments = await Appointment.findAll({ raw: true });
        const beds = await Bed.findAll({ raw: true });
        const labs = await Lab.findAll({ raw: true });
        const pharmacy = await Pharmacy.findAll({ raw: true });
        const billing = await Billing.findAll({ raw: true });

        const navConfig = [
            { id: 'dashboard', label: 'Dashboard', icon: 'ph-squares-four', roles: ['Admin', 'Doctor', 'Receptionist', 'Nurse', 'Lab Technician', 'Pharmacist', 'Patient'] },
            { id: 'patients', label: 'Patients', icon: 'ph-users', roles: ['Admin', 'Doctor', 'Receptionist', 'Nurse'] },
            { id: 'doctors', label: 'Doctors', icon: 'ph-stethoscope', roles: ['Admin', 'Doctor', 'Receptionist', 'Patient'] },
            { id: 'appointments', label: 'Appointments', icon: 'ph-calendar-plus', roles: ['Admin', 'Doctor', 'Receptionist', 'Patient'] },
            { id: 'beds', label: 'Bed Management', icon: 'ph-bed', roles: ['Admin', 'Nurse', 'Receptionist'] },
            { id: 'emr', label: 'EMR Records', icon: 'ph-file-text', roles: ['Admin', 'Doctor', 'Nurse'] },
            { id: 'labs', label: 'Laboratories', icon: 'ph-microscope', roles: ['Admin', 'Lab Technician', 'Doctor', 'Patient'] },
            { id: 'pharmacy', label: 'Pharmacy', icon: 'ph-pill', roles: ['Admin', 'Pharmacist', 'Doctor'] },
            { id: 'billing', label: 'Billing', icon: 'ph-receipt', roles: ['Admin', 'Receptionist', 'Patient'] },
            { id: 'database', label: 'Database Viewer', icon: 'ph-database', roles: ['Admin'] },
            { id: 'settings', label: 'Settings', icon: 'ph-gear', roles: ['Admin', 'Doctor', 'Receptionist', 'Nurse', 'Lab Technician', 'Pharmacist', 'Patient'] },
            { id: 'messages', label: 'Messages', icon: 'ph-envelope', roles: ['Admin', 'Doctor', 'Receptionist', 'Nurse', 'Lab Technician', 'Pharmacist'] }
        ];

        const messages = await Message.findAll({
            where: { receiverId: req.user.id },
            order: [['createdAt', 'DESC']],
            raw: true
        });
        
        const db = {
            roles: ['Admin', 'Doctor', 'Receptionist', 'Nurse', 'Lab Technician', 'Pharmacist', 'Patient'],
            currentUserRole: req.user.role || 'Admin',
            currentUserName: req.user.name || 'User',
            currentUserId: req.user.id,
            stats,
            patients,
            doctors,
            appointments,
            beds,
            labs,
            pharmacy,
            billing,
            messages,
            navConfig
        };

        res.json(db);
    } catch (error) {
        console.error('CRASH in /api/data:', error);
        res.status(500).json({ error: 'Failed to fetch data', details: error.message, stack: error.stack });
    }
});

app.get('/api/database', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'Admin') return res.status(403).json({ error: 'Access denied' });

        const tables = {
            users: await User.findAll({ raw: true }),
            stats: await Stat.findAll({ raw: true }),
            patients: await Patient.findAll({ raw: true }),
            doctors: await Doctor.findAll({ raw: true }),
            appointments: await Appointment.findAll({ raw: true }),
            beds: await Bed.findAll({ raw: true }),
            labs: await Lab.findAll({ raw: true }),
            pharmacies: await Pharmacy.findAll({ raw: true }),
            billings: await Billing.findAll({ raw: true })
        };

        res.json(tables);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch database' });
    }
});

// Messaging Endpoints
app.get('/api/messages', verifyToken, async (req, res) => {
    try {
        const received = await Message.findAll({ where: { receiverId: req.user.id }, order: [['createdAt', 'DESC']] });
        const sent = await Message.findAll({ where: { senderId: req.user.id }, order: [['createdAt', 'DESC']] });
        res.json({ received, sent });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

app.post('/api/messages', verifyToken, async (req, res) => {
    try {
        const { receiverId, receiverName, subject, content } = req.body;
        const message = await Message.create({
            senderId: req.user.id,
            senderName: req.user.name,
            receiverId,
            receiverName,
            subject,
            content,
            isRead: false
        });
        res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ error: 'Failed to send message' });
    }
});

// Change Password
app.put('/api/auth/change-password', verifyToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current and new password are required.' });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'New password must be at least 6 characters.' });
        }
        const user = await User.findByPk(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found.' });

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Current password is incorrect.' });

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        res.json({ message: 'Password updated successfully.' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Failed to change password.' });
    }
});

// Get all users (Admin only)
app.get('/api/users', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'Admin') return res.status(403).json({ error: 'Access denied.' });
        const users = await User.findAll({ attributes: ['id', 'name', 'email', 'role', 'createdAt'], raw: true });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users.' });
    }
});

// Update user role (Admin only)
app.put('/api/users/:id/role', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'Admin') return res.status(403).json({ error: 'Access denied.' });
        const { role } = req.body;
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found.' });
        user.role = role;
        await user.save();
        res.json({ message: 'Role updated.', user: { id: user.id, name: user.name, role: user.role } });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update role.' });
    }
});

// Delete user (Admin only)
app.delete('/api/users/:id', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'Admin') return res.status(403).json({ error: 'Access denied.' });
        if (parseInt(req.params.id) === req.user.id) return res.status(400).json({ error: 'Cannot delete your own account.' });
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found.' });
        await user.destroy();
        res.json({ message: 'User deleted.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete user.' });
    }
});

app.put('/api/messages/:id/read', verifyToken, async (req, res) => {
    try {
        const message = await Message.findOne({ where: { id: req.params.id, receiverId: req.user.id } });
        if (message) {
            message.isRead = true;
            await message.save();
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update message' });
    }
});

app.get('/api/users/staff', verifyToken, async (req, res) => {
    try {
        const staff = await User.findAll({
            where: { role: ['Admin', 'Doctor', 'Receptionist', 'Nurse', 'Lab Technician', 'Pharmacist'] },
            attributes: ['id', 'name', 'role'],
            raw: true
        });
        res.json(staff);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch staff' });
    }
});

// Error handling middleware
const fs = require('fs');
app.use((err, req, res, next) => {
    const errorDetail = `[${new Date().toISOString()}] ${err.stack || err}\n`;
    fs.appendFileSync('error_log.txt', errorDetail);
    console.error('GLOBAL ERROR HANDLER:', err);
    res.status(500).json({ 
        error: 'Internal server error', 
        details: err.message
    });
});

// Start server after database initialization
initializeDatabase().then(() => {
    const server = app.listen(port, () => {
        console.log(`Server listening on port ${port}`);
    });
    // Set timeout to 10 minutes to accommodate large file uploads
    server.timeout = 600000; 
}).catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
});

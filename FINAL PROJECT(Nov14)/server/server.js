const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const app = express();

app.use(bodyParser.json());

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'school_appointments'
});

db.connect(err => {
    if (err) throw err;
    console.log('MySQL Connected...');
});

// Admin login endpoint
app.post('/admin/login', (req, res) => {
    const { username, password } = req.body;

    const query = 'SELECT * FROM admins WHERE username = ?';
    db.query(query, [username], (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            const admin = results[0];
            bcrypt.compare(password, admin.password, (err, match) => {
                if (err) throw err;
                if (match) {
                    res.json({ message: 'Login successful', admin });
                } else {
                    res.status(401).json({ message: 'Invalid credentials' });
                }
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    });
});

// Save student appointment
app.post('/appointments', (req, res) => {
    const { student_name, program, contact_number, year_level, documentation, appointment_date } = req.body;

    const query = 'INSERT INTO appointments (student_name, program, contact_number, year_level, documentation, appointment_date, status) VALUES (?, ?, ?, ?, ?, ?, "Pending")';
    db.query(query, [student_name, program, contact_number, year_level, documentation, appointment_date], (err, result) => {
        if (err) throw err;
        res.json({ message: 'Appointment saved', appointmentId: result.insertId });
    });
});

// Fetch appointments for admin
app.get('/appointments', (req, res) => {
    db.query('SELECT * FROM appointments', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

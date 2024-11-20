//Initialize Dependencies and Database Connection

const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const port = 5000;

app.use(express.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST||"host.docker.internal",
  user: process.env.DB_USER||"root",
  password: process.env.DB_PASSWORD||"Mysql@123",
  database: process.env.DB_NAME||"LibraryManagementSystem_api"
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to DB:', err);
    return;
  }
  console.log('Connected to MySQL DB');
});

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,

  },
});

// User Registration Endpoint

app.post('/api/user/auth/register', async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
  
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
      db.query(query, [username, email, hashedPassword], (err, result) => {
        if (err) {
          return res.status(500).json({ message: 'Database error', error: err });
        }
        res.status(201).json({ message: 'User registered successfully' });
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  });

// User Login Endpoint

  app.post('/api/user/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
  
    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], async (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Database error', error: err });
      }
  
      if (results.length === 0) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
  
      const user = results[0];
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
  
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION });
      res.json({ message: 'Login successful', token });
    });
  });

  //Password Reset Request Endpoint
  app.post('/api/user/auth/request-reset-password', (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
  
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log(token)
    const expiration = Date.now() + parseInt(process.env.RESET_PASSWORD_EXPIRATION);
  
    const query = 'UPDATE users SET reset_token = ?, reset_token_expiration = ? WHERE email = ?';
    db.query(query, [token, expiration, email], (err, result) => {
      if (err || result.affectedRows === 0) {
        return res.status(500).json({ message: 'Database error or user not found' });
      }
  
      const resetLink = `http://localhost:5000/reset-password/${token}`;
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset Request',
        html: `<p>You requested a password reset. Click <a href="${resetLink}">here</a> to reset your password. The link is valid for 1 hour.</p>`,
      };
  
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return res.status(500).json({ message: 'Error sending email', error });
        }
        res.json({ message: 'Password reset email sent' });
      });
    });
  });

  // Password Reset Endpoint
  app.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
  
    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }
  
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(400).json({ message: 'Invalid or expired token' });
      }
  
      const query = 'SELECT * FROM users WHERE reset_token = ? AND reset_token_expiration > ?';
      db.query(query, [token, Date.now()], async (err, results) => {
        if (err || results.length === 0) {
          return res.status(400).json({ message: 'Invalid or expired token' });
        }
  
        const hashedPassword = await bcrypt.hash(password, 10);
        const updateQuery = 'UPDATE users SET password = ?, reset_token = NULL, reset_token_expiration = NULL WHERE id = ?';
        db.query(updateQuery, [hashedPassword, results[0].id], (err) => {
          if (err) {
            return res.status(500).json({ message: 'Database error', error: err });
          }
          res.json({ message: 'Password reset successful' });
        });
      });
    });
  });
  //User details Endpoint

  app.get('/api/user/details', (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
  
    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], async (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Database error', error: err });
      }
  
      if (results.length === 0) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      res.json({results });
  

    });
  });



  app.listen(5000,()=>{
    console.log("listening");
})
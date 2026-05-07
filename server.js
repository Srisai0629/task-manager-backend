const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Direct Connection to Railway
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Middleware to verify Token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access denied' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
};

// --- AUTHENTICATION ---

// Register
// Updated Register Route
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        // We removed "id" from the column list to let the DB auto-generate it
        const result = await pool.query(
            'INSERT INTO "User" (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id',
            [name, email, hash, role || 'Member']
        );
        
        res.status(201).json({ message: 'User registered successfully!', id: result.rows[0].id });
    } catch (error) {
        console.error(error);
        // If it still fails with the same error, it means your table needs a small tweak in Railway
        res.status(400).json({ error: 'Database error: ID column is not auto-incrementing.' });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await pool.query('SELECT * FROM "User" WHERE email = $1', [email]);
        
        if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });

        const user = result.rows[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) return res.status(400).json({ error: 'Invalid password' });

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});

// --- PROTECTED ROUTES ---

// Get Projects
app.get('/api/projects', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM "Project"');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running beautifully on port ${PORT}`);
});

app.get('/api/setup-db', async (req, res) => {
    try {
        // 1. Drop the old table if it exists
        await pool.query('DROP TABLE IF EXISTS "User" CASCADE');

        // 2. Create the table with an SERIAL id (Auto-incrementing integer)
        await pool.query(`
            CREATE TABLE "User" (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT DEFAULT 'Member'
            )
        `);
        
        res.send("Table 'User' has been recreated with Auto-Increment IDs! Try registering now.");
    } catch (err) {
        res.status(500).send("Error recreating table: " + err.message);
    }
});
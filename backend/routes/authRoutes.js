const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const db = require("../config/db");

// Register endpoint
router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        const [result] = await db.execute("INSERT INTO users (name, email, password, verification_code) VALUES (?, ?, ?, ?)", [name, email, hashedPassword, verificationCode]);

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: email,
            subject: "Kode Verifikasi Pendaftaran",
            html: `
        <h2>Kode Verifikasi Anda</h2>
        <p>Masukkan kode berikut untuk verifikasi akun Anda:</p>
        <h1 style="color: #007bff; font-size: 32px;">${verificationCode}</h1>
        <p>Kode ini akan kadaluarsa dalam 24 jam.</p>
      `,
        });

        res.json({ message: "Registrasi berhasil, silakan cek email untuk kode verifikasi" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Login endpoint
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const [users] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);
        const user = users[0];

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: "Email atau password salah" });
        }

        if (!user.is_verified) {
            return res.status(401).json({ error: "Email belum diverifikasi" });
        }

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Verify code endpoint
router.post("/verify-code", async (req, res) => {
    try {
        const { email, code } = req.body;

        const [users] = await db.execute("SELECT * FROM users WHERE email = ? AND verification_code = ?", [email, code]);

        if (users.length === 0) {
            return res.status(400).json({ error: "Kode verifikasi tidak valid" });
        }

        await db.execute("UPDATE users SET is_verified = true, verification_code = NULL WHERE email = ?", [email]);

        res.json({ message: "Email berhasil diverifikasi" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Resend verification endpoint
router.post("/resend-verification", async (req, res) => {
    try {
        const { email } = req.body;

        // Cek apakah user ada dan belum terverifikasi
        const [users] = await db.execute("SELECT * FROM users WHERE email = ? AND is_verified = false", [email]);

        if (users.length === 0) {
            return res.status(404).json({ error: "Email tidak ditemukan atau sudah terverifikasi" });
        }

        // Generate kode verifikasi baru 6 digit
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Update kode verifikasi
        await db.execute("UPDATE users SET verification_code = ? WHERE email = ?", [verificationCode, email]);

        // Kirim email dengan kode OTP
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: email,
            subject: "Kode Verifikasi Pendaftaran",
            html: `
        <h2>Kode Verifikasi Anda</h2>
        <p>Masukkan kode berikut untuk verifikasi akun Anda:</p>
        <h1 style="color: #007bff; font-size: 32px;">${verificationCode}</h1>
        <p>Kode ini akan kadaluarsa dalam 24 jam.</p>
      `,
        });

        res.json({ message: "Kode verifikasi baru telah dikirim ke email Anda" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Forgot password endpoint
router.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

        const [users] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);
        if (users.length === 0) {
            return res.status(404).json({ error: "Email tidak terdaftar" });
        }

        await db.execute("UPDATE users SET reset_code = ? WHERE email = ?", [resetCode, email]);

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: email,
            subject: "Kode Reset Password",
            html: `
        <h2>Reset Password</h2>
        <p>Berikut adalah kode untuk reset password Anda:</p>
        <h1 style="color: #007bff; font-size: 32px;">${resetCode}</h1>
        <p>Kode ini akan kadaluarsa dalam 1 jam.</p>
      `,
        });

        res.json({ message: "Kode reset password telah dikirim ke email Anda" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Reset password endpoint
router.post("/reset-password", async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;

        const [users] = await db.execute("SELECT * FROM users WHERE email = ? AND reset_code = ?", [email, code]);

        if (users.length === 0) {
            return res.status(400).json({ error: "Kode verifikasi tidak valid" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db.execute("UPDATE users SET password = ?, reset_code = NULL WHERE email = ?", [hashedPassword, email]);

        res.json({ message: "Password berhasil diubah" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

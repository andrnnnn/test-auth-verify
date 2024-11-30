const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const db = require("../config/db");

// Change password endpoint
router.post("/change-password", async (req, res) => {
    try {
        const { email, currentPassword, newPassword } = req.body;

        const [users] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);
        if (users.length === 0) {
            return res.status(404).json({ error: "User tidak ditemukan" });
        }

        const user = users[0];
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Password saat ini tidak valid" });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        await db.execute("UPDATE users SET password = ? WHERE email = ?", [hashedNewPassword, email]);

        res.json({ message: "Password berhasil diubah" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

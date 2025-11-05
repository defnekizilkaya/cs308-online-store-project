const express = require("express");
const bcrypt = require("bcrypt");
const pool = require("../config/db"); // <-- Knex değil, PG Pool

const router = express.Router();

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, tax_id, address, role } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email ve password zorunlu" });
    }

    // email var mı?
    const exist = await pool.query("SELECT 1 FROM users WHERE email = $1", [email]);
    if (exist.rowCount > 0) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const hash = await bcrypt.hash(password, 10);

    // Şeman: id, name, tax_id, email, password, address, role, created_at
    const insertSql = `
      INSERT INTO users (name, email, password, tax_id, address, role, created_at)
      VALUES ($1, $2, $3, COALESCE($4, ''), COALESCE($5, ''), COALESCE($6, 'user'), NOW())
      RETURNING id, name, email, role
    `;
    const params = [name, email, hash, tax_id, address, role];

    const { rows } = await pool.query(insertSql, params);
    return res.status(201).json(rows[0]);
  } catch (err) {
    console.error("REGISTER ERROR:", {
      code: err.code,
      detail: err.detail,
      message: err.message,
    });
    if (err.code === "23505") {
      return res.status(409).json({ message: "Email already exists" });
    }
    if (err.code === "23502") {
      return res.status(400).json({ message: "Missing required field" });
    }
    return res.status(500).json({ message: "Register failed" });
  }
});

module.exports = router;
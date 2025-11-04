const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/health', async (req, res) => {
  try {
    // DB access test
    const result = await pool.query('SELECT 1 as ok');
    const dbOk = result.rows?.[0]?.ok === 1;
    res.json({
      status: 'ok',
      service: 'backend',
      db: dbOk
    });
  } catch (err) {
    res.status(500).json({
      status: 'ok',
      service: 'backend',
      db: false,
      error: err.message
    });
  }
});

module.exports = router;

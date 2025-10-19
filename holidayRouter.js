// routes/holidayRouter.js
const express = require('express');
const router = express.Router();
const { HolidayAPI } = require('holidayapi');
const { DateTime } = require('luxon');

// Initialize API
const key = '6a27687b-8c0a-4314-a13a-9a126370d81c';
const holidayApi = new HolidayAPI({ key });

// Route: GET /holidays
router.get('/', async (req, res) => {
    try {
        const now = DateTime.now();
        const { country = 'IN', year = now.year, month = now.month, day = now.day } = req.query;

        const data = await holidayApi.holidays({
            country,
            year:'2024',
            month,
            day
        });

        res.status(200).json({
            success: true,
            holidays: data.holidays || [],
            meta: data
        });
    } catch (err) {
        console.error('❌ Error fetching holidays:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch holidays',
            error: err.message
        });
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const db = require('../db');
const ExpressError = require('../expressError');

// ! /** Get industries: [industry, industry, ...] */

router.get('/', async (req, res, next) => {
  try {
    const results = await db.query(`
      SELECT * FROM industries`);

    return res.json({ industries: results.rows });
  } catch (err) {
    return next(err);
  }
});

// Returning:
// [
//     {
//       "code": "ls",
//       "industry": "Lifestyle"
//     },
//     {
//       "code": "sh",
//       "industry": "Shopping"
//     } ...
//   ]

// ! /** Create new industry, return industry */
// POST

router.post('/', async (req, res, next) => {
  try {
    // Destructuring to extract name and type from request body
    const { code, industry } = req.body;
    const result = await db.query(
      `INSERT INTO industries (code, industry)
             VALUES ($1, $2)
             RETURNING code, industry`,
      [code, industry]
    );

    return res.status(201).json({ industries: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

// Sending:
//      {
//      	"code": "sp",
//      	"industry": "Sports"
//      }
// Returning:
//      {
//          "indsutries": {
//            "code": "sp",
//            "industry": "Sports"
//          }
//        }

module.exports = router;

const express = require('express');
const router = express.Router();
const db = require('../db');
const ExpressError = require('../expressError');

/* GET /companies */

router.get('/', async (req, res, next) => {
  try {
    const results = await db.query(`SELECT * FROM companies`);

    return res.json({ companies: results.rows });
  } catch (err) {
    return next(err);
  }
});

router.get('/:code', async (req, res, next) => {
  try {
    const { code } = req.params;

    const result = await db.query(`SELECT * FROM companies WHERE code = $1`, [
      code,
    ]);

    if (result.rows.length === 0) {
      throw new ExpressError(`Can't find company with code of ${code}`, 404);
    }

    return res.json({ companies: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

// Insomnia: http://localhost:3000/companies/ibm
// Returning:
// {
//     "companies": {
//       "code": "ibm",
//       "name": "IBM",
//       "description": "Big blue."
//     }
//   }

/* POST /companies */

router.post('/', async (req, res, next) => {
  try {
    const { code, name, description } = req.body;

    const result = await db.query(
      `INSERT INTO companies (code, name, description) 
        VALUES ($1, $2, $3) 
        RETURNING code, name, description`,
      [code, name, description]
    );
    return res.status(201).json({ company: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

// Insomnia: http://localhost:3000/companies
// Sending/Returning
// {
// 	"code": "amazon",
// 	"name": "Amazon",
// 	"description": "The god of shopping"
// }

/* PUT /companies/[code] */

router.put('/:code', async (req, res, next) => {
  try {
    const { code } = req.params;
    const { name, description } = req.body;
    const results = await db.query(
      `UPDATE companies SET name=$1, description=$2
            WHERE code = $3
            RETURNING code, name, description`,
      [name, description, code]
    );

    // if result has 0 rows
    if (results.rows.length === 0) {
      throw new ExpressError(`Can't find company with code ${code}`, 404);
    }

    return res.send({ company: results.rows[0] });
  } catch (err) {
    return next(err);
  }
});

// Insomnia: http://localhost:3000/companies/amazon
// Returning:
// {
//     "company": {
//       "code": "amazon",
//       "name": "Amazon",
//       "description": "The god of shopping for everything"
//     }
//   }

/* DELETE /companies/[code] */

router.delete('/:code', async (req, res, next) => {
  try {
    const { code } = req.params;
    const result = await db.query(
      'DELETE FROM companies WHERE code = $1 RETURNING code',
      [code]
    );

    // if result has 0 rows
    if (result.rows.length === 0) {
      throw new ExpressError(`Can't find company with code ${code}`, 404);
    }

    return res.json({ status: 'Deleted' });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;

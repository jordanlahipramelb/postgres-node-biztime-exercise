const express = require('express');
const router = express.Router();
const db = require('../db');
const ExpressError = require('../expressError');

const slugify = require('slugify');
// Ex: slugify('some string') // some-string
// or
// slugify('some string', '_')  // some_string

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
    const result = await db.query(
      `SELECT
            c.code,
            c.name,
            c.description,
            i.industry
        FROM companies AS c
          LEFT JOIN companies_industries AS ci 
              ON c.code = ci.company_code
          LEFT JOIN industries as i
               ON ci.industry_code = i.code
          WHERE c.code = $1`,
      [req.params.code]
    );

    if (result.rows.length === 0) {
      throw new ExpressError(
        `Can't find company with code of ${req.params.code}`,
        404
      );
    }

    let { code, name, description } = result.rows[0];
    // Easy to map the data into one variable, that way it will return as an array
    // For each row, give me the industry name
    let industries = result.rows.map((row) => row.industry);

    return res.json({ company: { code, name, description, industries } });
  } catch (err) {
    return next(err);
  }
});

// Insomnia: http://localhost:3000/companies/apple
// Returning:
// {
//   "code": "apple",
//   "name": "Apple Computer",
//   "description": "Maker of OSX.",
//   "industries": [
//     "Electronic",
//     "Lifestyle"
//   ]
// }

/* POST /companies */

router.post('/', async (req, res, next) => {
  try {
    const { name, description } = req.body;

    // code will autonatically be name given, but slugified lowercased with no spaces
    const code = slugify(name, { lower: true });

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
// Sending
// {
// 	"name": "Google",
// 	"description": "The place to search for things."
// }
// Returning:
// {
//   "company": {
//     "code": "google",
//     "name": "Google",
//     "description": "The place to search for things."
//   }
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

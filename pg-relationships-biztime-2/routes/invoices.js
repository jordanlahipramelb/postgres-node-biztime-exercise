const express = require('express');
const router = express.Router();
const db = require('../db');
const ExpressError = require('../expressError');

// GET /invoices

router.get('/', async (req, res, next) => {
  try {
    const results = await db.query(`SELECT * FROM invoices`);

    return res.json({ invoices: results.rows });
  } catch (err) {
    return next(err);
  }
});

// Insomnia: http://localhost:3000/invoices
// Returning:
// {
//     "invoices": [
//       {
//         "id": 1,
//         "comp_code": "apple",
//         "amt": 100,
//         "paid": false,
//         "add_date": "2021-08-30T07:00:00.000Z",
//         "paid_date": null
//       } ...
//      [

// GET /invoices/[id]

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await db.query(`SELECT * FROM invoices WHERE id = $1`, [id]);

    if (result.rows.length === 0) {
      throw new ExpressError(`Can't find id of ${id}`, 404);
    }

    return res.json({ invoices: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

// Insomnia: http://localhost:3000/invoices/3
// Returning:
// {
//     "invoices": {
//       "id": 3,
//       "comp_code": "apple",
//       "amt": 300,
//          ...
//     }
//   }

// POST /invoices

router.post('/', async (req, res, next) => {
  try {
    const { comp_code, amt } = req.body;

    const result = await db.query(
      `INSERT INTO invoices (comp_code , amt) 
          VALUES ($1, $2) 
          RETURNING comp_code , amt, paid, add_date, paid_date`,
      [comp_code, amt]
    );
    return res.status(201).json({ invoices: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

// Insomnia: http://localhost:3000/invoices
// Sending:
// {
// 	"comp_code": "apple",
// 	"amt": 1000
// }
// Returning
// {
//     "invoices": {
//       "comp_code": "apple",
//       "amt": 1000,
//       "paid": false,
//       "add_date": "2021-08-30T07:00:00.000Z",
//       "paid_date": null
//     }
//   }

// PUT /invoices/[id]

router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amt, paid } = req.body;
    let paidDate = null;

    // When updating paid for an invoice
    // retrieve paid column of invoice of current id
    const currInvoice = await db.query(
      `SELECT paid 
        FROM invoices
        WHERE id =$1`,
      [id]
    );
    // if result has 0 rows/ if invoice can't be found
    if (currInvoice.rows.length === 0) {
      throw new ExpressError(`Can't find invoice with id ${id}`, 404);
    }

    // In order to update the date, we need to retrieve paid_date column in currInvoice
    const currPaidDate = currInvoice.rows[0].paid_date;
    // If paying unpaid invoice: sets paid_date to today
    // (if null paid_date AND paid is true), paidDate is today
    if (!currPaidDate && paid) {
      paidDate = new Date();
    }
    // If updating paid from true to false: sets paid_date to null
    else if (!paid) {
      paidDate = null;
    }
    // Else: keep current paid_date
    else {
      paidDate = currPaidDate;
    }

    const results = await db.query(
      `UPDATE invoices 
          SET amt=$1, paid=$2, paid_date=$3
          WHERE id = $4
          RETURNING comp_code , amt, paid, add_date, paid_date`,
      [amt, paid, paidDate, id]
    );

    return res.send({ invoices: results.rows[0] });
  } catch (err) {
    return next(err);
  }
});

// Insomnia: http://localhost:3000/invoices/1
// For paying an invoice:
//      Sending:
//          {
//          	"amt": 800
//            "paid": true
//          }
//      Invoice before
//         {
//           "invoices": {
//             "id": 1,
//             "comp_code": "apple",
//             "amt": 100,
//             "paid": false,
//             "add_date": "2021-08-30T07:00:00.000Z",
//             "paid_date": null
//           }
//         }
//      Invoice after
//         {
//           "invoices": {
//             "comp_code": "apple",
//             "amt": 100,
//             "paid": true,
//             "add_date": "2021-08-30T07:00:00.000Z",
//             "paid_date": "2021-08-31T07:00:00.000Z"
//           }
//         }

// For un-paying an invoice
//      Sending:
//          {
//          	"amt": 800
//            "paid": false
//          }
//      Invoice before
//        {
//        "invoices": {
//           "comp_code": "apple",
//           "amt": 100,
//           "paid": true,
//           "add_date": "2021-08-30T07:00:00.000Z",
//           "paid_date": "2021-08-31T07:00:00.000Z"
//           }
//        }
//       Invoice after
//        {
//          "invoices": {
//            "comp_code": "apple",
//            "amt": 100,
//            "paid": false,
//            "add_date": "2021-08-30T07:00:00.000Z",
//            "paid_date": null
//          }
//        }

// DELETE /invoices/[id]

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'DELETE FROM invoices WHERE id = $1 RETURNING id',
      [id]
    );

    // if result has 0 rows
    if (result.rows.length === 0) {
      throw new ExpressError(`Can't find invoice with id ${id}`, 404);
    }

    return res.json({ status: 'Deleted' });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;

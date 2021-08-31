/** Database setup for BizTime. */

const { Client } = require('pg');

let DB_URI;

// 2 possible databases
// if node enviromnent is 'test' ; this is out testing DB
if (process.env.NODE_ENV === 'test') {
  DB_URI = 'postgresql:///biztime_test'; // testing db
} else {
  DB_URI = 'postgresql:///biztime'; // main db
}

let db = new Client({
  connectionString: DB_URI,
});

db.connect();

module.exports = db;

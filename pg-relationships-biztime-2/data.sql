DROP DATABASE IF EXISTS biztime;

CREATE DATABASE biztime;

\ c biztime;

DROP TABLE IF EXISTS invoices;

DROP TABLE IF EXISTS companies;

DROP TABLE IF EXISTS industries;

DROP TABLE IF EXISTS companies_industries;

CREATE TABLE companies (
  code text PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text
);

--   code  |      name      |            description             
-- --------+----------------+------------------------------------
--  apple  | Apple Computer | Maker of OSX.
--  ibm    | IBM            | Big blue.
--  amazon | Amazon         | The god of shopping for everything
-- Many to Many
-- One industry connected to several companies
-- One company belonging to several industries
-- in other words..
-- Multiple companies associated with multiple industries
CREATE TABLE industries (
  code text PRIMARY KEY,
  industry text NOT NULL UNIQUE
);

--  code |  industry  
-- ------+------------
--  ls   | Lifestyle
--  sh   | Shopping
--  et   | Electronic
CREATE TABLE companies_industries (
  company_code TEXT NOT NULL REFERENCES companies,
  industry_code TEXT NOT NULL REFERENCES industries,
  PRIMARY KEY(company_code, industry_code)
);

--  company_code | industry_code 
-- --------------+---------------
--  apple        | et
--  apple        | ls
--  reddit       | ls
--  amazon       | sh
CREATE TABLE invoices (
  id serial PRIMARY KEY,
  comp_code text NOT NULL REFERENCES companies ON DELETE CASCADE,
  amt float NOT NULL,
  paid boolean DEFAULT false NOT NULL,
  add_date date DEFAULT CURRENT_DATE NOT NULL,
  paid_date date,
  CONSTRAINT invoices_amt_check CHECK ((amt > (0) :: double precision))
);

--  id | comp_code | amt  | paid |  add_date  | paid_date 
-- ----+-----------+------+------+------------+-----------
--   1 | apple     |  100 | f    | 2021-08-30 | 
--   2 | apple     |  200 | f    | 2021-08-30 | 
--   4 | ibm       |  400 | f    | 2021-08-30 | 
--   5 | apple     | 1000 | f    | 2021-08-30 | 
INSERT INTO
  companies
VALUES
  ('apple', 'Apple Computer', 'Maker of OSX.'),
  ('ibm', 'IBM', 'Big blue.'),
  ('amazon', 'Amazon', 'Big shopping.'),
  ('reddit', 'Reddit', 'Forums.');

INSERT INTO
  industries
VALUES
  ('ls', 'Lifestyle'),
  ('sh', 'Shopping'),
  ('et', 'Electronic');

INSERT INTO
  invoices (comp_Code, amt, paid, paid_date)
VALUES
  ('apple', 100, false, NULL),
  ('apple', 200, false, NULL),
  ('apple', 300, TRUE, '2018-01-01'),
  ('ibm', 400, false, NULL);

INSERT INTO
  companies_industries
VALUES
  ('apple', 'et'),
  ('apple', 'ls'),
  ('reddit', 'ls'),
  ('amazon', 'sh');

-- SELECT
--   c.code,
--   c.name,
--   c.description,
--   i.industry
-- FROM
--   companies AS c
--   LEFT JOIN companies_industries AS ci 
-- * Matches the c.code (company.code) to the SAME code in companies_industries.company_code in order to join them
--   ON c.code = ci.company_code
--   LEFT JOIN industries as i
-- * Matches the companies_industries.industry_code to the SAME code in industries.code in order to join them
--   ON ci.industry_code = i.code
--   WHERE company_code = 'apple'
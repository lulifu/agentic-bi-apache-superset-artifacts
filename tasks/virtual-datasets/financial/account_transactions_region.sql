SELECT
  t.trans_id,
  t.account_id,
  CAST(t.date AS DATE) AS trans_date,
  DATE_TRUNC('month', CAST(t.date AS DATE)) AS trans_month,
  DATE_TRUNC('quarter', CAST(t.date AS DATE)) AS trans_quarter,
  EXTRACT(YEAR FROM CAST(t.date AS DATE)) AS trans_year,
  EXTRACT(MONTH FROM CAST(t.date AS DATE)) AS trans_month_of_year,
  t.type AS trans_type,
  t.operation,
  t.k_symbol,
  t.amount AS trans_amount,
  t.balance AS post_transaction_balance,
  a.frequency AS account_frequency,
  CAST(a.date AS DATE) AS account_opened_date,
  d.district_id,
  d."A2" AS district_name,
  d."A3" AS region,
  CAST(d."A4" AS INTEGER) AS inhabitants,
  CAST(d."A11" AS NUMERIC) AS avg_salary,
  CAST(d."A12" AS NUMERIC) AS unemployment_1995,
  CAST(d."A13" AS NUMERIC) AS unemployment_1996
FROM trans t
JOIN account a ON a.account_id = t.account_id
JOIN district d ON d.district_id = a.district_id

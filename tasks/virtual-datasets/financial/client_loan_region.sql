SELECT
  c.client_id,
  c.gender,
  CAST(c.birth_date AS DATE) AS birth_date,
  EXTRACT(YEAR FROM AGE(DATE '1998-12-31', CAST(c.birth_date AS DATE))) AS age_as_of_1998,
  dp.disp_id,
  dp.type AS disposition_type,
  a.account_id,
  a.frequency AS account_frequency,
  CAST(a.date AS DATE) AS account_opened_date,
  d.district_id,
  d."A2" AS district_name,
  d."A3" AS region,
  CAST(d."A4" AS INTEGER) AS inhabitants,
  CAST(d."A11" AS NUMERIC) AS avg_salary,
  CAST(d."A12" AS NUMERIC) AS unemployment_1995,
  CAST(d."A13" AS NUMERIC) AS unemployment_1996,
  CAST(d."A15" AS NUMERIC) AS crimes_1995,
  CAST(d."A16" AS NUMERIC) AS crimes_1996,
  l.loan_id,
  CAST(l.date AS DATE) AS loan_date,
  EXTRACT(YEAR FROM CAST(l.date AS DATE)) AS loan_year,
  l.amount AS loan_amount,
  l.duration AS loan_duration_months,
  l.payments AS loan_payment_amount,
  l.status AS loan_status,
  CASE
    WHEN l.status = 'A' THEN 'finished_ok'
    WHEN l.status = 'B' THEN 'finished_default'
    WHEN l.status = 'C' THEN 'running_ok'
    WHEN l.status = 'D' THEN 'running_in_debt'
    ELSE 'unknown'
  END AS loan_status_label
FROM client c
JOIN disp dp ON dp.client_id = c.client_id
JOIN account a ON a.account_id = dp.account_id
JOIN district d ON d.district_id = a.district_id
LEFT JOIN loan l ON l.account_id = a.account_id

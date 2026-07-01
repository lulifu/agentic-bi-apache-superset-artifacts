SELECT
  t.trans_id,
  t.account_id,
  CAST(t.date AS DATE) AS trans_date,
  DATE_TRUNC('month', CAST(t.date AS DATE)) AS trans_month,
  EXTRACT(YEAR FROM CAST(t.date AS DATE)) AS trans_year,
  t.type AS trans_type,
  t.operation,
  t.k_symbol,
  t.amount AS trans_amount,
  t.balance AS post_transaction_balance,
  a.district_id,
  d."A2" AS district_name,
  d."A3" AS region,
  c.card_id,
  c.type AS card_type,
  CAST(c.issued AS DATE) AS card_issued_date,
  DATE_TRUNC('quarter', CAST(c.issued AS DATE)) AS card_issued_quarter,
  CASE
    WHEN CAST(c.issued AS DATE) >= DATE '1997-10-01'
     AND CAST(c.issued AS DATE) < DATE '1998-01-01'
    THEN 'issued_late_1997'
    ELSE 'existing_or_other_issue_date'
  END AS card_issuance_cohort
FROM trans t
JOIN account a ON a.account_id = t.account_id
JOIN district d ON d.district_id = a.district_id
JOIN disp dp ON dp.account_id = a.account_id
JOIN card c ON c.disp_id = dp.disp_id
WHERE t.operation = 'VYBER KARTOU'

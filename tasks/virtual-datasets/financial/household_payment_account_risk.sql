WITH sipo_monthly AS (
  SELECT
    t.account_id,
    CAST(DATE_TRUNC('month', CAST(t.date AS DATE)) AS DATE) AS trans_month,
    SUM(t.amount) AS monthly_sipo_amount
  FROM trans t
  WHERE t.k_symbol = 'SIPO'
  GROUP BY 1, 2
),
baseline_1996 AS (
  SELECT
    account_id,
    AVG(monthly_sipo_amount) AS avg_monthly_sipo_1996
  FROM sipo_monthly
  WHERE trans_month >= DATE '1996-01-01'
    AND trans_month < DATE '1997-01-01'
  GROUP BY 1
)
SELECT
  sm.account_id,
  sm.trans_month,
  EXTRACT(YEAR FROM sm.trans_month) AS trans_year,
  sm.monthly_sipo_amount,
  b.avg_monthly_sipo_1996,
  sm.monthly_sipo_amount / NULLIF(b.avg_monthly_sipo_1996, 0) AS ratio_to_1996_baseline,
  a.frequency AS account_frequency,
  d.district_id,
  d."A2" AS district_name,
  d."A3" AS region,
  CAST(d."A11" AS NUMERIC) AS avg_salary,
  CAST(d."A13" AS NUMERIC) AS unemployment_1996
FROM sipo_monthly sm
JOIN baseline_1996 b ON b.account_id = sm.account_id
JOIN account a ON a.account_id = sm.account_id
JOIN district d ON d.district_id = a.district_id

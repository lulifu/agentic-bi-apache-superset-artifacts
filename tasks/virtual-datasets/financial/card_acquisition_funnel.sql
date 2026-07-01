WITH first_card_withdrawal AS (
  SELECT
    c.card_id,
    MIN(CAST(t.date AS DATE)) AS first_card_withdrawal_date
  FROM card c
  JOIN disp dp ON dp.disp_id = c.disp_id
  JOIN trans t ON t.account_id = dp.account_id
  WHERE t.operation = 'VYBER KARTOU'
  GROUP BY c.card_id
),
card_base AS (
  SELECT
    c.card_id,
    c.disp_id,
    dp.client_id,
    dp.account_id,
    c.type AS card_type,
    CAST(c.issued AS DATE) AS card_issued_date,
    CAST(DATE_TRUNC('quarter', CAST(c.issued AS DATE)) AS DATE) AS card_issued_quarter,
    fcw.first_card_withdrawal_date,
    fcw.first_card_withdrawal_date - CAST(c.issued AS DATE) AS days_to_first_card_withdrawal
  FROM card c
  JOIN disp dp ON dp.disp_id = c.disp_id
  LEFT JOIN first_card_withdrawal fcw ON fcw.card_id = c.card_id
)
SELECT
  *,
  'issued_card' AS funnel_stage
FROM card_base
UNION ALL
SELECT
  *,
  'first_card_withdrawal' AS funnel_stage
FROM card_base
WHERE first_card_withdrawal_date IS NOT NULL

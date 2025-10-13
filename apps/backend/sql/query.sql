-- name: FindAllUsers :many
SELECT * FROM users;

-- name: FindUserByID :one
SELECT * FROM users WHERE id = $1 LIMIT 1;

-- name: CreateEvent :exec
INSERT INTO events (id, name, amount, event_date, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6);

-- name: FindAllEvents :many
SELECT * FROM events;

-- name: FindEventById :one
SELECT * FROM events WHERE id = $1 LIMIT 1;

-- name: CreatePayment :exec
INSERT INTO payments (event_id, payer_id, debtor_id, amount) VALUES ($1, $2, $3, $4);

-- name: FindPaymentsByEventId :many
SELECT * FROM payments WHERE event_id = $1;

-- name: FindPaymentByDebtorId :one
SELECT * FROM payments WHERE event_id = $1 AND debtor_id = $2 LIMIT 1;

-- name: ListCreditAggregatesByUserID :many
WITH credits AS (
  SELECT p.debtor_id AS counterparty_id, SUM(p.amount)::bigint AS credit_amount
  FROM payments AS p
  WHERE p.payer_id = $1
  GROUP BY p.debtor_id
),
debts AS (
  SELECT p.payer_id AS counterparty_id, SUM(p.amount)::bigint AS debt_amount
  FROM payments AS p
  WHERE p.debtor_id = $1
  GROUP BY p.payer_id
)
SELECT
  COALESCE(credits.counterparty_id, debts.counterparty_id) AS counterparty_id,
  COALESCE(credits.credit_amount, 0)::bigint AS credit_amount,
  COALESCE(debts.debt_amount, 0)::bigint AS debt_amount
FROM credits
FULL OUTER JOIN debts USING (counterparty_id)
ORDER BY 1;

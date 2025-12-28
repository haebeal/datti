-- name: FindAllUsers :many
SELECT id, name, avatar, email, created_at, updated_at FROM users;

-- name: FindUserByID :one
SELECT id, name, avatar, email, created_at, updated_at FROM users WHERE id = $1 LIMIT 1;

-- name: CreateEvent :exec
INSERT INTO events (id, name, amount, event_date, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6);

-- name: FindAllEvents :many
SELECT id, name, amount, event_date, created_at, updated_at FROM events;

-- name: FindEventById :one
SELECT id, name, amount, event_date, created_at, updated_at FROM events WHERE id = $1 LIMIT 1;

-- name: FindLendingsByUserId :many
SELECT e.id, e.name, e.amount, e.event_date, e.created_at, e.updated_at
FROM events e
INNER JOIN event_payments ep ON e.id = ep.event_id
INNER JOIN payments p ON ep.payment_id = p.id
WHERE p.payer_id = $1;

-- name: FindEventsByDebtorId :many
SELECT
  e.id AS event_id,
  e.name,
  e.event_date,
  p.amount,
  e.created_at,
  e.updated_at
FROM events e
INNER JOIN event_payments ep ON e.id = ep.event_id
INNER JOIN payments p ON ep.payment_id = p.id
WHERE p.debtor_id = $1;

-- name: CreatePayment :exec
INSERT INTO payments (id, payer_id, debtor_id, amount, created_at, updated_at)
VALUES ($1, $2, $3, $4, current_timestamp, current_timestamp);

-- name: CreateEventPayment :exec
INSERT INTO event_payments (event_id, payment_id)
VALUES ($1, $2);

-- name: FindPaymentsByEventId :many
SELECT p.id, p.payer_id, p.debtor_id, p.amount, p.created_at, p.updated_at
FROM payments p
INNER JOIN event_payments ep ON p.id = ep.payment_id
WHERE ep.event_id = $1;

-- name: FindPaymentByDebtorId :one
SELECT p.id, p.payer_id, p.debtor_id, p.amount, p.created_at, p.updated_at
FROM payments p
INNER JOIN event_payments ep ON p.id = ep.payment_id
WHERE ep.event_id = $1 AND p.debtor_id = $2 LIMIT 1;

-- name: UpdatePaymentAmount :exec
UPDATE payments
SET amount = $2,
    updated_at = current_timestamp
WHERE id = $1;

-- name: DeletePayment :exec
DELETE FROM payments WHERE id = $1;

-- name: DeleteEventPayment :exec
DELETE FROM event_payments WHERE event_id = $1 AND payment_id = $2;

-- name: UpdateEvent :exec
UPDATE events
SET name = $2,
    amount = $3,
    event_date = $4,
    updated_at = $5
WHERE id = $1;

-- name: DeleteEvent :exec
DELETE FROM events WHERE id = $1;

-- name: ListLendingCreditAmountsByUserID :many
SELECT debtor_id AS user_id, SUM(amount)::bigint AS amount
FROM payments
WHERE payer_id = $1
GROUP BY debtor_id
ORDER BY debtor_id;

-- name: ListBorrowingCreditAmountsByUserID :many
SELECT payer_id AS user_id, SUM(amount)::bigint AS amount
FROM payments
WHERE debtor_id = $1
GROUP BY payer_id
ORDER BY payer_id;

-- name: CreateRepayment :exec
INSERT INTO payments (id, payer_id, debtor_id, amount, created_at, updated_at)
VALUES ($1, $2, $3, $4, $5, $6);

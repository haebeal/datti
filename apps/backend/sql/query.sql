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

-- name: FindLendingsByUserId :many
SELECT e.id, e.name, e.amount, e.event_date, e.created_at, e.updated_at
FROM events e
INNER JOIN payments p ON e.id = p.event_id
WHERE p.payer_id = $1;

-- name: CreatePayment :exec
INSERT INTO payments (event_id, payer_id, debtor_id, amount) VALUES ($1, $2, $3, $4);

-- name: FindPaymentsByEventId :many
SELECT * FROM payments WHERE event_id = $1;

-- name: FindPaymentByDebtorId :one
SELECT * FROM payments WHERE event_id = $1 AND debtor_id = $2 LIMIT 1;

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

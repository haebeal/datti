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


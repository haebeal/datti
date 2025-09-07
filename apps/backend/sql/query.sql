-- name: FindAllUsers :many
SELECT * FROM users;

-- name: FindUserByID :one
SELECT * FROM users WHERE id = $1 LIMIT 1;

-- name: UpdateUser :exec
UPDATE users SET name = $2, avatar = $3, email = $4 WHERE id = $1;

-- name: CreateEvent :exec
INSERT INTO events (id, name, payer_id, amount, event_date, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7);

-- name: FindAllEvents :many
SELECT * FROM events;

-- name: FindEventById :one
SELECT * FROM events WHERE id = $1 LIMIT 1;

-- name: UpdateEvent :exec
UPDATE events SET name = $2, payer_id = $3, amount = $4, event_date = $5, updated_at = $6 WHERE id = $1;

-- name: DeleteEvent :exec
DELETE FROM events WHERE id = $1;

-- name: CreatePayment :exec
INSERT INTO payments (event_id, debtor_id, amount) VALUES ($1, $2, $3);

-- name: FindPaymentsByEventId :many
SELECT * FROM payments WHERE event_id = $1;

-- name: UpdatePayment :exec
UPDATE payments SET debtor_id = $2, amount = $3 WHERE event_id = $1;

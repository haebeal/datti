-- name: FindAllUsers :many
SELECT id, name, avatar, email, created_at, updated_at FROM users;

-- name: FindUsersBySearch :many
SELECT id, name, avatar, email, created_at, updated_at
FROM users
WHERE (sqlc.narg('name')::text IS NOT NULL AND name ILIKE '%' || sqlc.narg('name') || '%')
   OR (sqlc.narg('email')::text IS NOT NULL AND email ILIKE '%' || sqlc.narg('email') || '%')
ORDER BY name ASC
LIMIT sqlc.arg('limit');

-- name: FindUserByID :one
SELECT id, name, avatar, email, created_at, updated_at FROM users WHERE id = $1 LIMIT 1;

-- name: CreateUser :exec
INSERT INTO users (id, name, avatar, email, created_at, updated_at)
VALUES ($1, $2, $3, $4, current_timestamp, current_timestamp);

-- name: UpdateUser :exec
UPDATE users
SET name = $2, avatar = $3, updated_at = current_timestamp
WHERE id = $1;

-- name: CreateEvent :exec
INSERT INTO events (id, group_id, name, amount, event_date, created_at, updated_at)
VALUES ($1, $2, $3, $4, $5, $6, $7);

-- name: FindAllEvents :many
SELECT id, group_id, name, amount, event_date, created_at, updated_at FROM events;

-- name: FindEventById :one
SELECT id, group_id, name, amount, event_date, created_at, updated_at
FROM events WHERE id = $1 LIMIT 1;

-- name: FindLendingsByGroupIDAndUserID :many
SELECT DISTINCT e.id, e.group_id, e.name, e.amount, e.event_date, e.created_at, e.updated_at
FROM events e
INNER JOIN event_payments ep ON e.id = ep.event_id
INNER JOIN payments p ON ep.payment_id = p.id
WHERE e.group_id = $1 AND p.payer_id = $2;

-- name: FindLendingsByGroupIDAndUserIDWithCursor :many
SELECT DISTINCT e.id, e.group_id, e.name, e.amount, e.event_date, e.created_at, e.updated_at
FROM events e
INNER JOIN event_payments ep ON e.id = ep.event_id
INNER JOIN payments p ON ep.payment_id = p.id
WHERE e.group_id = sqlc.arg('group_id')
  AND p.payer_id = sqlc.arg('payer_id')
  AND (sqlc.narg('cursor')::text IS NULL OR e.id < sqlc.narg('cursor'))
ORDER BY e.id DESC
LIMIT sqlc.arg('limit');

-- name: FindEventsByGroupIDAndDebtorID :many
SELECT
  e.id AS event_id,
  e.group_id,
  e.name,
  e.event_date,
  p.amount,
  e.created_at,
  e.updated_at
FROM events e
INNER JOIN event_payments ep ON e.id = ep.event_id
INNER JOIN payments p ON ep.payment_id = p.id
WHERE e.group_id = $1 AND p.debtor_id = $2;

-- name: FindEventByGroupIDAndDebtorIDAndEventID :one
SELECT
  e.id AS event_id,
  e.group_id,
  e.name,
  e.event_date,
  p.amount,
  e.created_at,
  e.updated_at
FROM events e
INNER JOIN event_payments ep ON e.id = ep.event_id
INNER JOIN payments p ON ep.payment_id = p.id
WHERE e.group_id = $1 AND p.debtor_id = $2 AND e.id = $3
LIMIT 1;

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

-- name: FindDebtorsByEventIDs :many
SELECT ep.event_id, u.id, u.name, u.avatar, u.email, p.amount
FROM payments p
INNER JOIN event_payments ep ON p.id = ep.payment_id
INNER JOIN users u ON p.debtor_id = u.id
WHERE ep.event_id = ANY(sqlc.arg('event_ids')::text[]);

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
  AND payer_id != debtor_id
GROUP BY debtor_id
ORDER BY debtor_id;

-- name: ListBorrowingCreditAmountsByUserID :many
SELECT payer_id AS user_id, SUM(amount)::bigint AS amount
FROM payments
WHERE debtor_id = $1
  AND payer_id != debtor_id
GROUP BY payer_id
ORDER BY payer_id;

-- name: CreateRepayment :exec
INSERT INTO payments (id, payer_id, debtor_id, amount, created_at, updated_at)
VALUES ($1, $2, $3, $4, $5, $6);

-- name: FindRepaymentsByPayerID :many
SELECT p.id, p.payer_id, p.debtor_id, p.amount, p.created_at, p.updated_at
FROM payments p
LEFT JOIN event_payments ep ON p.id = ep.payment_id
WHERE p.payer_id = $1 AND ep.event_id IS NULL
ORDER BY p.created_at DESC;

-- name: FindRepaymentsByPayerIDWithCursor :many
SELECT p.id, p.payer_id, p.debtor_id, p.amount, p.created_at, p.updated_at
FROM payments p
LEFT JOIN event_payments ep ON p.id = ep.payment_id
WHERE p.payer_id = sqlc.arg('payer_id')
  AND ep.event_id IS NULL
  AND (sqlc.narg('cursor')::text IS NULL OR p.id < sqlc.narg('cursor'))
ORDER BY p.id DESC
LIMIT sqlc.arg('limit');

-- name: FindRepaymentByID :one
SELECT p.id, p.payer_id, p.debtor_id, p.amount, p.created_at, p.updated_at
FROM payments p
LEFT JOIN event_payments ep ON p.id = ep.payment_id
WHERE p.id = $1 AND ep.event_id IS NULL
LIMIT 1;

-- name: UpdateRepayment :exec
UPDATE payments
SET amount = $2, updated_at = $3
WHERE id = $1;

-- name: DeleteRepayment :exec
DELETE FROM payments WHERE id = $1;

-- name: CreateGroup :exec
INSERT INTO groups (id, name, created_by, created_at, updated_at)
VALUES ($1, $2, $3, $4, $5);

-- name: AddGroupMember :exec
INSERT INTO group_members (group_id, user_id, created_at)
VALUES ($1, $2, current_timestamp);

-- name: DeleteGroupMember :exec
DELETE FROM group_members
WHERE group_id = $1 AND user_id = $2;

-- name: FindGroupByID :one
SELECT id, name, created_by, created_at, updated_at
FROM groups WHERE id = $1 LIMIT 1;

-- name: FindGroupMembersByGroupID :many
SELECT user_id FROM group_members
WHERE group_id = $1 ORDER BY created_at ASC;

-- name: FindGroupMemberUsersByGroupID :many
SELECT u.id, u.name, u.avatar, u.email
FROM users u
INNER JOIN group_members gm ON u.id = gm.user_id
WHERE gm.group_id = $1
ORDER BY gm.created_at ASC;

-- name: UpdateGroup :exec
UPDATE groups
SET name = $2,
    updated_at = $3
WHERE id = $1;

-- name: DeleteGroup :exec
DELETE FROM groups
WHERE id = $1;

-- name: DeletePaymentsByGroupID :exec
DELETE FROM payments
WHERE id IN (
  SELECT ep.payment_id
  FROM event_payments ep
  INNER JOIN events e ON ep.event_id = e.id
  WHERE e.group_id = $1
);

-- name: DeletePaymentsByGroupIDAndUserID :exec
DELETE FROM payments
WHERE id IN (
  SELECT ep.payment_id
  FROM event_payments ep
  INNER JOIN events e ON ep.event_id = e.id
  INNER JOIN payments p ON ep.payment_id = p.id
  WHERE e.group_id = $1
    AND (p.payer_id = $2 OR p.debtor_id = $2)
);

-- name: FindGroupsByMemberUserID :many
SELECT g.id, g.name, g.created_by, g.created_at, g.updated_at
FROM groups g
INNER JOIN group_members gm ON g.id = gm.group_id
WHERE gm.user_id = $1
ORDER BY g.created_at DESC;

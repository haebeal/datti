-- name: FindAllUsers :many
SELECT * FROM users;

-- name: FindUserByID :one
SELECT * FROM users WHERE id = $1 LIMIT 1;

-- name: UpdateUser :exec
UPDATE users SET name = $2, avatar = $3, email = $4 WHERE id = $1;

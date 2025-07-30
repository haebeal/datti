-- name: CreateEvent :exec
INSERT INTO events (
  id, name, event_at, created_at, updated_at
) VALUES (
  $1, $2, $3, $4, $5
);

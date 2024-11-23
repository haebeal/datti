package model

import (
	"time"

	"github.com/google/uuid"
)

type Group struct {
	ID        uuid.UUID  `bun:"id,pk,type:uuid,default:gen_random_uuid()"`
	Name      string     `bun:"name,notnull"`
	CreatedAt time.Time  `bun:"created_at,nullzero,notnull,default:current_timestamp"`
	UpdatedAt time.Time  `bun:"updated_at,nullzero,notnull,default:current_timestamp"`
	DeletedAt *time.Time `bun:"deleted_at,soft_delete"`
}

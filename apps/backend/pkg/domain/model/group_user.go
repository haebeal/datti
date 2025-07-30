package model

import "github.com/google/uuid"

type GroupUser struct {
	User   *User     `bun:"rel:belongs-to,join:user_id=id"`
	UserID uuid.UUID `bun:"user_id,pk,type:uuid"`

	Group   *Group    `bun:"rel:belongs-to,join:group_id=id"`
	GroupID uuid.UUID `bun:"group_id,pk,type:uuid"`
}

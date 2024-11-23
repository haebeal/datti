package model

import "github.com/google/uuid"

type Friend struct {
	UserIDUser *User     `bun:"rel:belongs-to,join:user_id=id"`
	UserID     uuid.UUID `bun:"user_id,pk,type:uuid"`

	FriendUserIDUser *User     `bun:"rel:belongs-to,join:friend_user_id=id"`
	FriendUserID     uuid.UUID `bun:"friend_user_id,pk,type:uuid"`
}

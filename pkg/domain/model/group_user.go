package model

type GroupUser struct {
	UserID  string `bun:"uid,pk"`
	GroupID string `bun:"groupId,pk"`
	Owner   bool   `bun:"owner,notnull"`
}

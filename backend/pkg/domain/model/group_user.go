package model

type GroupUser struct {
	UserID  string `bun:"uid,pk"`
	GroupID string `bun:"group_id,pk"`
	Owner   bool   `bun:"owner,notnull"`
}

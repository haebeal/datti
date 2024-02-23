package model

type GroupUser struct {
	UserID  string `json:"uid"`
	GroupID string `json:"groupId"`
	Owner   bool   `gorm:"not null"`
}

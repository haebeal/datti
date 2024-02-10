package model

import (
	"time"

	"gorm.io/gorm"
)

type GroupUser struct {
	UserID    string         `gorm:"uniqueIndex:idx_user_group"`
	GroupID   string         `gorm:"uniqueIndex:idx_user_group"`
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `json:"deletedAt" gorm:"index"`
	Owner     bool           `gorm:"not null"`
	// EventsUserID  []Event `gorm:"foreignKey:CreatedBy;references:UserID"` // CreatedBy列の外部キー
	// EventsGroupID []Event `gorm:"foreignKey:GroupID;references:GroupID"`  // GroupID列の外部キー
	User  User
	Group Group
}

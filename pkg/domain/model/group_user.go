package model

import (
	"time"

	"gorm.io/gorm"
)

type GroupUser struct {
	UserID    string         `json:"uid" gorm:"primarykey"`
	GroupID   string         `json:"groupId" gorm:"primarykey"`
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `json:"deletedAt" gorm:"index"`
	Owner     bool           `gorm:"not null"`
	// EventsUserID  []Event `gorm:"foreignKey:CreatedBy;references:UserID"` // CreatedBy列の外部キー
	// EventsGroupID []Event `gorm:"foreignKey:GroupID;references:GroupID"`  // GroupID列の外部キー
}

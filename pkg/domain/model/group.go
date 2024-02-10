package model

import (
	"time"

	"gorm.io/gorm"
)

type Group struct {
	ID        string         `json:"id" gorm:"primarykey"`
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `json:"deletedAt" gorm:"index"`
	Name      string         `gorm:"not null"`
	GroupUser []GroupUser    `gorm:"foreignKey:GroupID"`
}

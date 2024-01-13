package model

import "gorm.io/gorm"

type Group struct {
	gorm.Model
	Name      string      `gorm:"not null"`
	GroupUser []GroupUser `gorm:"foreignKey:GroupID"`
}

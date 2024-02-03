package model

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	ID          string `json:"uid" gorm:"primarykey"`
	CreatedAt   time.Time
	UpdatedAt   time.Time
	DeletedAt   gorm.DeletedAt `gorm:"index"`
	GroupUser   []GroupUser    `gorm:"foreignKey:UserID"`
	BankAccount []BankAccount  `gorm:"foreignKey:UserID"`
	// PaymentsPaidBy []Payment   `gorm:"foreignKey:PaidBy"`
	// PaymentsPaidTo []Payment   `gorm:"foreignKey:PaidTo"`
}

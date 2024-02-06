package model

import (
	"time"

	"gorm.io/gorm"
)

type BankAccount struct {
	UserID      string `gorm:"primarykey"`
	CreatedAt   time.Time
	UpdatedAt   time.Time
	DeletedAt   gorm.DeletedAt `gorm:"index"`
	AccountCode string         `json:"accountCode"`
	BankCode    string         `json:"bankCode"`
	BranchCode  string         `json:"branchCode"`
}

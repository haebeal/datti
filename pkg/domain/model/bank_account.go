package model

import (
	"time"

	"gorm.io/gorm"
)

type BankAccount struct {
	UserID      string         `json:"uid" gorm:"primarykey"`
	CreatedAt   time.Time      `json:"createdAt"`
	UpdatedAt   time.Time      `json:"updatedAt"`
	DeletedAt   gorm.DeletedAt `json:"deletedAt" gorm:"index"`
	AccountCode string         `json:"accountCode"`
	BankCode    string         `json:"bankCode"`
	BranchCode  string         `json:"branchCode"`
}

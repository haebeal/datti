package model

import "gorm.io/gorm"

type BankAccount struct {
	gorm.Model
	UserID      uint
	AccountCode string `json:"accountCode"`
	BankCode    string `json:"bankCode"`
	BranchCode  string `json:"branchCode"`
}

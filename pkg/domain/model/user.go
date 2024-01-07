package model

import "gorm.io/gorm"

type User struct {
	gorm.Model
	Name        string `json:"name" gorm:"not null"`
	Email       string `json:"email" gorm:"not null;unique"`
	PhotoUrl    string `json:"photoUrl"`
	AccountCode string `json:"accountCode"`
	BankCode    string `gorm:"default:null"`
	BranchCode  string `json:"branchCode"`
	// GroupUsers     []GroupUser `gorm:"foreignKey:UserID"`
	// PaymentsPaidBy []Payment   `gorm:"foreignKey:PaidBy"`
	// PaymentsPaidTo []Payment   `gorm:"foreignKey:PaidTo"`
}

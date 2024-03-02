package model

import (
	"time"
)

type BankAccount struct {
	UID         string     `bun:"uid,pk"`
	AccountCode string     `bun:"account_code"`
	BankCode    string     `bun:"bank_code"`
	BranchCode  string     `bun:"branch_code"`
	CreatedAt   time.Time  `bun:"created_at,nullzero,notnull,default:current_timestamp"`
	UpdatedAt   time.Time  `bun:"updated_at,nullzero,notnull,default:current_timestamp"`
	DeletedAt   *time.Time `bun:"deleted_at,soft_delete"`
}

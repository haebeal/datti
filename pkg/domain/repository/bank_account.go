package repository

import (
	"context"

	"github.com/datti-api/ent"
)

type BankAccountRepository interface {
	UpsertBankAccount(c context.Context, uid string, accountCode string, bankCode string, branchCode string) (string, error)
	GetBankAccountById(c context.Context, uid string) (*ent.BankAccount, error)
	DeleteBankAccount(c context.Context, uid string) (*ent.BankAccount, error)
}

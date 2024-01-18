package repository

import (
	"context"

	"github.com/datti-api/pkg/domain/model"
)

type BankAccountRepository interface {
	CreateBankAccount(c context.Context, user *model.User, bank *model.BankAccount) (*model.BankAccount, error)
	GetBankAccountById(c context.Context, user *model.User) (*model.BankAccount, error)
	UpdateBankAccount(c context.Context, user *model.User, bank *model.BankAccount) (*model.BankAccount, error)
}

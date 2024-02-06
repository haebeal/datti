package usecase

import (
	"context"

	"github.com/datti-api/pkg/domain/model"
	"github.com/datti-api/pkg/domain/repository"
)

type BankAccountUseCase interface {
	UpsertBankAccount(c context.Context, bank *model.BankAccount) (*model.BankAccount, error)
	GetBankAccountById(c context.Context, user *model.User) (*model.BankAccount, error)
	UpdateBankAccount(c context.Context, user *model.User, bank *model.BankAccount) (*model.BankAccount, error)
}

type bankAccountUseCase struct {
	repository repository.BankAccountRepository
}

// CreateBankAccount implements BankAccountUseCase.
func (bu *bankAccountUseCase) UpsertBankAccount(c context.Context, bank *model.BankAccount) (*model.BankAccount, error) {
	newBankAccount, err := bu.repository.UpsertBankAccount(c, bank)
	if err != nil {
		return nil, err
	}
	return newBankAccount, nil
}

// GetBankAccountById implements BankAccountUseCase.
func (*bankAccountUseCase) GetBankAccountById(c context.Context, user *model.User) (*model.BankAccount, error) {
	panic("unimplemented")
}

// UpdateBankAccount implements BankAccountUseCase.
func (*bankAccountUseCase) UpdateBankAccount(c context.Context, user *model.User, bank *model.BankAccount) (*model.BankAccount, error) {
	panic("unimplemented")
}

func NewBankAccountUseCase(bankAccountRepo repository.BankAccountRepository) BankAccountUseCase {
	return &bankAccountUseCase{
		repository: bankAccountRepo,
	}
}

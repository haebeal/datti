package usecase

import (
	"context"

	"github.com/datti-api/pkg/domain/model"
	"github.com/datti-api/pkg/domain/repository"
)

type BankAccountUseCase interface {
	UpsertBankAccount(c context.Context, uid string, accountCode string, bankCode string, branchCode string) (*model.BankAccount, error)
	GetBankAccountById(c context.Context, uid string) (*model.BankAccount, error)
	DeleteBankAccount(c context.Context, uid string) (*model.BankAccount, error)
}
type bankAccountUseCase struct {
	repository  repository.BankAccountRepository
	transaction repository.Transaction
}

// DeleteBankAccount implements BankAccountUseCase.
func (b *bankAccountUseCase) DeleteBankAccount(c context.Context, uid string) (*model.BankAccount, error) {
	panic("unimplemented")
}

// GetBankAccountById implements BankAccountUseCase.
func (b *bankAccountUseCase) GetBankAccountById(c context.Context, uid string) (*model.BankAccount, error) {
	panic("unimplemented")
}

// UpsertBankAccount implements BankAccountUseCase.
func (b *bankAccountUseCase) UpsertBankAccount(c context.Context, uid string, accountCode string, bankCode string, branchCode string) (*model.BankAccount, error) {
	panic("unimplemented")
}

func NewBankAccountUseCase(bankAccountRepo repository.BankAccountRepository, tx repository.Transaction) BankAccountUseCase {
	return &bankAccountUseCase{
		repository:  bankAccountRepo,
		transaction: tx,
	}
}

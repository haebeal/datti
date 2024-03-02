package usecase

import (
	"context"

	"github.com/datti-api/pkg/domain/model"
	"github.com/datti-api/pkg/domain/repository"
)

type BankAccountUseCase interface {
	UpsertBankAccount(c context.Context, uid string, accountCode string, bankCode string, branchCode string) (*model.BankAccount, error)
	GetBankAccountByUid(c context.Context, uid string) (*model.BankAccount, error)
	DeleteBankAccount(c context.Context, uid string) (*model.BankAccount, error)
}
type bankAccountUseCase struct {
	repository  repository.BankAccountRepository
	transaction repository.Transaction
}

// DeleteBankAccount implements BankAccountUseCase.
func (bu *bankAccountUseCase) DeleteBankAccount(c context.Context, uid string) (*model.BankAccount, error) {
	v, err := bu.transaction.DoInTx(c, func(ctx context.Context) (interface{}, error) {
		return bu.repository.DeleteBankAccount(c, uid)
	})
	if err != nil {
		return nil, err
	}

	return v.(*model.BankAccount), nil
}

// GetBankAccountById implements BankAccountUseCase.
func (bu *bankAccountUseCase) GetBankAccountByUid(c context.Context, uid string) (*model.BankAccount, error) {
	bankAccount, err := bu.repository.GetBankAccountByUid(c, uid)
	if err != nil {
		return nil, err
	}

	return bankAccount, nil
}

// UpsertBankAccount implements BankAccountUseCase.
func (bu *bankAccountUseCase) UpsertBankAccount(c context.Context, uid string, accountCode string, bankCode string, branchCode string) (*model.BankAccount, error) {
	v, err := bu.transaction.DoInTx(c, func(ctx context.Context) (interface{}, error) {
		return bu.repository.UpsertBankAccount(c, uid, accountCode, bankCode, branchCode)
	})
	if err != nil {
		return nil, err
	}

	return v.(*model.BankAccount), nil
}

func NewBankAccountUseCase(bankAccountRepo repository.BankAccountRepository, tx repository.Transaction) BankAccountUseCase {
	return &bankAccountUseCase{
		repository:  bankAccountRepo,
		transaction: tx,
	}
}

package usecase

import (
	"context"

	"github.com/datti-api/pkg/domain/model"
	"github.com/datti-api/pkg/domain/repository"
	"github.com/datti-api/pkg/validator"
)

type BankAccountUseCase interface {
	UpsertBankAccount(c context.Context, bank *model.BankAccount) (*model.BankAccount, error)
	GetBankAccountById(c context.Context, uid string) (*model.BankAccount, error)
	DeleteBankAccount(c context.Context, uid string) error
}

type bankAccountUseCase struct {
	repository  repository.BankAccountRepository
	transaction repository.Transaction
}

// CreateBankAccount implements BankAccountUseCase.
func (bu *bankAccountUseCase) UpsertBankAccount(c context.Context, bank *model.BankAccount) (*model.BankAccount, error) {
	v, err := bu.transaction.DoInTx(c, func(ctx context.Context) (interface{}, error) {
		if err := validator.ValidatorAccountCode(bank.AccountCode); err != nil {
			return nil, err
		}
		if err := validator.ValidatorBankCode(bank.BankCode); err != nil {
			return nil, err
		}
		if err := validator.ValidatorBranchCode(bank.BranchCode); err != nil {
			return nil, err
		}
		return bu.repository.UpsertBankAccount(c, bank)
	})
	if err != nil {
		return nil, err
	}

	return v.(*model.BankAccount), nil
}

// GetBankAccountById implements BankAccountUseCase.
func (bu *bankAccountUseCase) GetBankAccountById(c context.Context, uid string) (*model.BankAccount, error) {
	findBankAccount, err := bu.repository.GetBankAccountById(c, uid)
	if err != nil {
		return nil, err
	}

	return findBankAccount, nil
}

func (bu *bankAccountUseCase) DeleteBankAccount(c context.Context, uid string) error {
	_, err := bu.transaction.DoInTx(c, func(ctx context.Context) (interface{}, error) {
		return bu.repository.DeleteBankAccount(c, uid)
	})
	if err != nil {
		return err
	}

	return nil
}

func NewBankAccountUseCase(bankAccountRepo repository.BankAccountRepository, tx repository.Transaction) BankAccountUseCase {
	return &bankAccountUseCase{
		repository:  bankAccountRepo,
		transaction: tx,
	}
}

package usecase

import (
	"context"

	"github.com/datti-api/ent"
	"github.com/datti-api/pkg/domain/repository"
	"github.com/datti-api/pkg/validator"
)

type BankAccountUseCase interface {
	UpsertBankAccount(c context.Context, uid string, accountCode string, bankCode string, branchCode string) (*ent.BankAccount, error)
	GetBankAccountById(c context.Context, uid string) (*ent.BankAccount, error)
	DeleteBankAccount(c context.Context, uid string) (*ent.BankAccount, error)
}
type bankAccountUseCase struct {
	repository  repository.BankAccountRepository
	transaction repository.Transaction
}

// CreateBankAccount implements BankAccountUseCase.
func (bu *bankAccountUseCase) UpsertBankAccount(c context.Context, uid string, accountCode string, bankCode string, branchCode string) (*ent.BankAccount, error) {
	v, err := bu.transaction.DoInTx(c, func(ctx context.Context) (interface{}, error) {
		if err := validator.ValidatorAccountCode(accountCode); err != nil {
			return nil, err
		}
		if err := validator.ValidatorBankCode(bankCode); err != nil {
			return nil, err
		}
		if err := validator.ValidatorBranchCode(branchCode); err != nil {
			return nil, err
		}
		return bu.repository.UpsertBankAccount(c, uid, accountCode, bankCode, branchCode)
	})
	if err != nil {
		return nil, err
	}

	return v.(*ent.BankAccount), nil
}

// GetBankAccountById implements BankAccountUseCase.
func (bu *bankAccountUseCase) GetBankAccountById(c context.Context, uid string) (*ent.BankAccount, error) {
	findBankAccount, err := bu.repository.GetBankAccountById(c, uid)
	if err != nil {
		return nil, err
	}

	return findBankAccount, nil
}

func (bu *bankAccountUseCase) DeleteBankAccount(c context.Context, uid string) (*ent.BankAccount, error) {
	v, err := bu.transaction.DoInTx(c, func(ctx context.Context) (interface{}, error) {
		return bu.repository.DeleteBankAccount(c, uid)
	})
	if err != nil {
		return nil, err
	}

	return v.(*ent.BankAccount), nil
}

func NewBankAccountUseCase(bankAccountRepo repository.BankAccountRepository, tx repository.Transaction) BankAccountUseCase {
	return &bankAccountUseCase{
		repository:  bankAccountRepo,
		transaction: tx,
	}
}

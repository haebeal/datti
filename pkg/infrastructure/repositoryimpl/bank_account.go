package repositoryimpl

import (
	"context"

	"github.com/datti-api/pkg/domain/model"
	"github.com/datti-api/pkg/domain/repository"
	"github.com/datti-api/pkg/infrastructure/database"
)

type bankAccountRepositoryImpl struct {
	DBEngine database.DBClient
}

// DeleteBankAccount implements repository.BankAccountRepository.
func (br *bankAccountRepositoryImpl) DeleteBankAccount(c context.Context, uid string) (*model.BankAccount, error) {
	bankAccount := new(model.BankAccount)
	_, err := br.DBEngine.Client.NewDelete().Model(bankAccount).Where("uid = ?", uid).Exec(c)
	if err != nil {
		return nil, err
	}

	return bankAccount, nil
}

// GetBankAccountById implements repository.BankAccountRepository.
func (br *bankAccountRepositoryImpl) GetBankAccountByUid(c context.Context, uid string) (*model.BankAccount, error) {
	bankAccount := new(model.BankAccount)
	err := br.DBEngine.Client.NewSelect().Model(bankAccount).Where("uid = ?", uid).Scan(c)
	if err != nil {
		return nil, err
	}

	return bankAccount, nil
}

// UpsertBankAccount implements repository.BankAccountRepository.
func (br *bankAccountRepositoryImpl) UpsertBankAccount(c context.Context, uid string, accountCode string, bankCode string, branchCode string) (*model.BankAccount, error) {
	bankAccount := new(model.BankAccount)
	err := br.DBEngine.Client.NewInsert().
		Model(bankAccount).
		Value("uid", "?", uid).
		Value("account_code", "?", accountCode).
		Value("bank_code", "?", bankCode).
		Value("branch_code", "?", branchCode).
		On("CONFLICT (uid) DO UPDATE").
		Set("account_code = ?", accountCode).
		Set("bank_code = ?", bankCode).
		Set("branch_code = ?", branchCode).
		Set("deleted_at = ?", nil).
		Scan(c)
	if err != nil {
		return nil, err
	}

	return bankAccount, nil
}

func NewBankAccountRepository(engine *database.DBClient) repository.BankAccountRepository {
	return &bankAccountRepositoryImpl{
		DBEngine: *engine,
	}
}

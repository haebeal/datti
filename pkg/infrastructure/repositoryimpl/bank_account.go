package repositoryimpl

import (
	"context"

	"github.com/datti-api/pkg/domain/model"
	"github.com/datti-api/pkg/domain/repository"
	"github.com/datti-api/pkg/infrastructure/database"
)

type bankAccountRepositoryImpl struct {
	DBEngine database.DBEngine
}

// CreateBankAccount implements repository.BankAccountRepository.
func (br *bankAccountRepositoryImpl) UpsertBankAccount(c context.Context, bank *model.BankAccount) (*model.BankAccount, error) {
	result := br.DBEngine.Engine.Where("user_id = ?", bank.UserID).Save(bank).Scan(bank)
	if result.Error != nil {
		return nil, result.Error
	}

	return bank, nil
}

// GetBankAccountById implements repository.BankAccountRepository.
func (br *bankAccountRepositoryImpl) GetBankAccountById(c context.Context, user *model.User) (*model.BankAccount, error) {
	findBankAccount := new(model.BankAccount)
	result := br.DBEngine.Engine.Where("user_id = ?", user.ID).First(findBankAccount)
	if result.Error != nil {
		return nil, result.Error
	}

	return findBankAccount, nil
}

// UpdateBankAccount implements repository.BankAccountRepository.
func (*bankAccountRepositoryImpl) UpdateBankAccount(c context.Context, user *model.User, bank *model.BankAccount) (*model.BankAccount, error) {
	panic("unimplemented")
}

func NewBankAccountRepository(engine *database.DBEngine) repository.BankAccountRepository {
	return &bankAccountRepositoryImpl{
		DBEngine: *engine,
	}
}

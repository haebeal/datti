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
func (*bankAccountRepositoryImpl) CreateBankAccount(c context.Context, user *model.User, bank *model.BankAccount) (*model.BankAccount, error) {
	panic("unimplemented")
}

// GetBankAccountById implements repository.BankAccountRepository.
func (*bankAccountRepositoryImpl) GetBankAccountById(c context.Context, user *model.User) (*model.BankAccount, error) {
	panic("unimplemented")
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

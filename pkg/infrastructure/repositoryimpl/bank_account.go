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
func (b *bankAccountRepositoryImpl) DeleteBankAccount(c context.Context, uid string) (*model.BankAccount, error) {
	panic("unimplemented")
}

// GetBankAccountById implements repository.BankAccountRepository.
func (b *bankAccountRepositoryImpl) GetBankAccountById(c context.Context, uid string) (*model.BankAccount, error) {
	panic("unimplemented")
}

// UpsertBankAccount implements repository.BankAccountRepository.
func (b *bankAccountRepositoryImpl) UpsertBankAccount(c context.Context, uid string, accountCode string, bankCode string, branchCode string) (string, error) {
	panic("unimplemented")
}

func NewBankAccountRepository(engine *database.DBClient) repository.BankAccountRepository {
	return &bankAccountRepositoryImpl{
		DBEngine: *engine,
	}
}

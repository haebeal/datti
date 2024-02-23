package repositoryimpl

import (
	"context"
	"time"

	"entgo.io/ent/dialect/sql"
	"github.com/datti-api/ent"
	"github.com/datti-api/ent/bankaccount"
	"github.com/datti-api/pkg/domain/repository"
	"github.com/datti-api/pkg/infrastructure/database"
)

type bankAccountRepositoryImpl struct {
	DBEngine database.DBClient
}

// CreateBankAccount implements repository.BankAccountRepository.
func (br *bankAccountRepositoryImpl) UpsertBankAccount(c context.Context, uid string, accountCode string, bankCode string, branchCode string) (*ent.BankAccount, error) {
	id, err := br.DBEngine.Client.BankAccount.
		Create().
		SetID(uid).
		SetAccountCode(accountCode).
		SetBankCode(bankCode).
		SetBranchCode(branchCode).
		OnConflict(
			sql.ConflictColumns(bankaccount.FieldID),
		).
		Update(func(bau *ent.BankAccountUpsert) {
			bau.SetAccountCode(accountCode)
			bau.SetBankCode(bankCode)
			bau.SetBranchCode(branchCode)
			bau.SetNull("deleted_at")
			bau.UpdateUpdatedAt()
		}).
		ID(c)
	if err != nil {
		return nil, err
	}
	bankAccount, err := br.DBEngine.Client.BankAccount.
		Query().
		Where(bankaccount.IDEQ(id)).
		Only(c)
	if err != nil {
		return nil, err
	}

	return bankAccount, nil
}

// GetBankAccountById implements repository.BankAccountRepository.
func (br *bankAccountRepositoryImpl) GetBankAccountById(c context.Context, uid string) (*ent.BankAccount, error) {
	bankAccount, err := br.DBEngine.Client.BankAccount.
		Query().
		Where(bankaccount.IDEQ(uid)).
		Only(c)
	if err != nil {
		return nil, err
	}

	return bankAccount, nil
}

func (br *bankAccountRepositoryImpl) DeleteBankAccount(c context.Context, uid string) (*ent.BankAccount, error) {
	err := br.DBEngine.Client.BankAccount.
		UpdateOneID(uid).
		SetAccountCode("").
		SetBankCode("").
		SetBranchCode("").
		SetDeletedAt(time.Now()).
		Exec(c)
	if err != nil {
		return nil, err
	}

	return nil, err
}

func NewBankAccountRepository(engine *database.DBClient) repository.BankAccountRepository {
	return &bankAccountRepositoryImpl{
		DBEngine: *engine,
	}
}

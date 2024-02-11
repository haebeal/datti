package repositoryimpl

import (
	"context"

	"github.com/datti-api/pkg/domain/repository"
	"gorm.io/gorm"
)

type transactionRepositoryImpl struct {
	db *gorm.DB
}

func NewTransactionRepository(db *gorm.DB) repository.TransactionRepository {
	return &transactionRepositoryImpl{
		db: db,
	}
}

// Transaction implements repository.TransactionRepository.
func (t *transactionRepositoryImpl) Transaction(c context.Context, f func(tx *gorm.DB) error) error {
	tx := t.db.WithContext(c).Begin()

	err := f(tx)
	if err != nil {
		tx.Rollback()
		return err
	}

	if err := tx.Commit().Error; err != nil {
		return err
	}

	return nil
}

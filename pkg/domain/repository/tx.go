package repository

import (
	"context"

	"gorm.io/gorm"
)

type TransactionRepository interface {
	Transaction(c context.Context, f func(tx *gorm.DB) error) error
}

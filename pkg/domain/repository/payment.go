package repository

import (
	"context"
	"time"

	"github.com/datti-api/pkg/domain/model"
)

type PaymentRepository interface {
	CreatePayment(c context.Context, id string, paidTo string, paidBy string, paidAt time.Time, amount int) (*model.Payment, error)
	UpdatePayment(c context.Context, id string, paidTo string, paidBy string, paidAt time.Time, amount int) (*model.Payment, error)
	GetPayments(c context.Context, uid string) ([]*model.Payment, error)
	GetPayment(c context.Context, id string) (*model.Payment, error)
	DeletePayment(c context.Context, id string) error
}

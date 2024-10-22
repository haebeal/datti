package repository

import (
	"context"
	"time"

	"github.com/datti-api/pkg/domain/model"
	"github.com/google/uuid"
)

type PaymentRepository interface {
	CreatePayment(c context.Context, paidTo uuid.UUID, paidBy uuid.UUID, paidAt time.Time, amount int) (*model.Payment, error)
	CreatePaymentWihtEventId(c context.Context, eventId uuid.UUID, paidTo uuid.UUID, paidBy uuid.UUID, paidAt time.Time, amount int) (*model.Payment, error)
	UpdatePayment(c context.Context, id uuid.UUID, paidTo uuid.UUID, paidBy uuid.UUID, paidAt time.Time, amount int) (*model.Payment, error)
	GetPayments(c context.Context, uid uuid.UUID) ([]*model.PaymentResult, error)
	GetPaidBy(c context.Context, uid uuid.UUID) ([]*model.Payment, error)
	GetPaidTo(c context.Context, uid uuid.UUID) ([]*model.Payment, error)
	GetPayment(c context.Context, id uuid.UUID) (*model.Payment, error)
	GetPaymentByEventId(c context.Context, eventId uuid.UUID) ([]*model.Payment, error)
	GetHistory(c context.Context, uid uuid.UUID) ([]*model.Payment, error)
	DeletePayment(c context.Context, id uuid.UUID) error
}

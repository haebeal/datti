package usecase

import (
	"time"

	"github.com/haebeal/datti/internal/domain"
)

type PaymentUseCase interface {
	Create(name string, amount int64, paidBy string, eventDate time.Time, payments []*struct {
		userID string
		amount int64
	}) (*domain.PaymentEvent, error)
}
type paymentUseCase struct {
	pr domain.PaymentEventRepository
	ur domain.UserRepository
}

func NewPaymentUseCase(pr domain.PaymentEventRepository, ur domain.UserRepository) *paymentUseCase {
	return &paymentUseCase{
		pr: pr,
		ur: ur,
	}
}

func (pu *paymentUseCase) Create(name string, amount int64, paidBy string, eventDate time.Time, payments []struct {
	userID string
	amount int64
}) (*domain.PaymentEvent, error) {
	user, err := pu.ur.FindByID(paidBy)
	if err != nil {
		return nil, err
	}

	a, err := domain.NewAmount(amount)
	if err != nil {
		return nil, err
	}
	payer, err := domain.NewPayer(user, a)
	if err != nil {
		return nil, err
	}

	var debtors []*domain.Debtor
	for _, p := range payments {
		user, err := pu.ur.FindByID(p.userID)
		if err != nil {
			return nil, err
		}
		a, err := domain.NewAmount(p.amount)
		if err != nil {
			return nil, err
		}
		debtor, err := domain.NewDebtor(user, a)
		if err != nil {
			return nil, err
		}

		debtors = append(debtors, debtor)
	}

	event, err := domain.CreatePaymentEvent(name, payer, debtors, eventDate)
	if err != nil {
		return nil, err
	}

	err = pu.pr.Create(event)
	if err != nil {
		return nil, err
	}

	return event, nil
}

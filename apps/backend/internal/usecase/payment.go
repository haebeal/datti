package usecase

import (
	"time"

	"github.com/google/uuid"
	"github.com/haebeal/datti/internal/domain"
)

type Debtor struct {
	ID     uuid.UUID
	Amount int64
}

type CreateCommand struct {
	Name      string
	PayerID   uuid.UUID
	Amount    int64
	Debtors   []Debtor
	EventDate time.Time
}
type PaymentUseCase interface {
	Create(CreateCommand) (*domain.PaymentEvent, error)
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

func (pu *paymentUseCase) Create(cc CreateCommand) (*domain.PaymentEvent, error) {
	user, err := pu.ur.FindByID(cc.PayerID)
	if err != nil {
		return nil, err
	}

	a, err := domain.NewAmount(cc.Amount)
	if err != nil {
		return nil, err
	}
	payer, err := domain.NewPayer(user, a)
	if err != nil {
		return nil, err
	}

	var debtors []*domain.Debtor
	for _, d := range cc.Debtors {
		user, err := pu.ur.FindByID(d.ID)
		if err != nil {
			return nil, err
		}
		a, err := domain.NewAmount(d.Amount)
		if err != nil {
			return nil, err
		}
		debtor, err := domain.NewDebtor(user, a)
		if err != nil {
			return nil, err
		}

		debtors = append(debtors, debtor)
	}

	event, err := domain.CreatePaymentEvent(cc.Name, payer, debtors, cc.EventDate)
	if err != nil {
		return nil, err
	}

	err = pu.pr.Create(event)
	if err != nil {
		return nil, err
	}

	return event, nil
}

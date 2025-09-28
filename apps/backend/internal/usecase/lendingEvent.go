package usecase

import (
	"fmt"

	"github.com/haebeal/datti/internal/domain"
	"github.com/haebeal/datti/internal/presentation/api/handler"
)

type LendingEventUseCaseImpl struct {
	ur domain.UserRepository
	pr domain.PayerRepository
	dr domain.DebtorRepository
	lr domain.LendingEventRepository
}

func NewLendingEventUseCase(ur domain.UserRepository, dr domain.DebtorRepository, lr domain.LendingEventRepository) LendingEventUseCaseImpl {
	return LendingEventUseCaseImpl{
		ur: ur,
		dr: dr,
		lr: lr,
	}
}

func (u *LendingEventUseCaseImpl) Create(i handler.CreateInput) (*handler.CreateOutput, error) {
	eventAmount, err := domain.NewAmount(i.Amount)
	if err != nil {
		return nil, err
	}
	event, err := domain.CreateLendingEvent(i.Name, eventAmount, i.EventDate)
	if err != nil {
		return nil, err
	}
	err = u.lr.Create(event)
	if err != nil {
		return nil, err
	}

	paidUser, err := u.ur.FindByID(i.UserID)
	if err != nil {
		return nil, err
	}
	payer, err := domain.NewPayer(paidUser.ID(), paidUser.Name(), paidUser.Avatar(), paidUser.Email())
	if err != nil {
		return nil, err
	}

	var debtors []*domain.Debtor
	for _, d := range i.Debts {
		user, err := u.ur.FindByID(d.UserID)
		if err != nil {
			return nil, err
		}
		amount, err := domain.NewAmount(d.Amount)
		if err != nil {
			return nil, err
		}
		debtor, err := domain.NewDebtor(user.ID(), user.Name(), user.Avatar(), user.Email(), amount)
		if err != nil {
			return nil, err
		}
		err = u.dr.Create(payer, debtor)
		if err != nil {
			return nil, err
		}
		debtors = append(debtors, debtor)
	}

	return &handler.CreateOutput{
		Event:   event,
		Debtors: debtors,
	}, nil
}

func (u *LendingEventUseCaseImpl) Get(i handler.GetInput) (*handler.GetOutput, error) {
	payer, err := u.pr.FindByEventID(i.EventID)
	if err != nil {
		return nil, err
	}

	if payer.ID() != i.UserID {
		return nil, fmt.Errorf("lendingEventが存在しません")
	}

	event, err := u.lr.FindByID(i.EventID)
	if err != nil {
		return nil, err
	}

	debtors, err := u.dr.FindByEventID(i.EventID)
	if err != nil {
		return nil, err
	}

	output := &handler.GetOutput{
		Event:   event,
		Debtors: debtors,
	}

	return output, nil
}

package usecase

import (
	"context"
	"fmt"

	"github.com/haebeal/datti/internal/domain"
	"github.com/haebeal/datti/internal/presentation/api/handler"
)

type LendingUseCaseImpl struct {
	ur domain.UserRepository
	pr domain.PayerRepository
	dr domain.DebtorRepository
	lr domain.LendingEventRepository
}

func NewLendingUseCase(ur domain.UserRepository, pr domain.PayerRepository, dr domain.DebtorRepository, lr domain.LendingEventRepository) LendingUseCaseImpl {
	return LendingUseCaseImpl{
		ur: ur,
		pr: pr,
		dr: dr,
		lr: lr,
	}
}

func (u LendingUseCaseImpl) Create(ctx context.Context, i handler.CreateInput) (*handler.CreateOutput, error) {
	ctx, span := tracer.Start(ctx, "lending.Create")
	defer span.End()

	eventAmount, err := domain.NewAmount(i.Amount)
	if err != nil {
		span.RecordError(err)
		return nil, err
	}
	event, err := domain.CreateLendingEvent(i.Name, eventAmount, i.EventDate)
	if err != nil {
		span.RecordError(err)
		return nil, err
	}
	err = u.lr.Create(ctx, event)
	if err != nil {
		span.RecordError(err)
		return nil, err
	}

	paidUser, err := u.ur.FindByID(ctx, i.UserID)
	if err != nil {
		span.RecordError(err)
		return nil, err
	}
	payer, err := domain.NewPayer(paidUser.ID(), paidUser.Name(), paidUser.Avatar(), paidUser.Email())
	if err != nil {
		span.RecordError(err)
		return nil, err
	}

	var debtors []*domain.Debtor
	for _, d := range i.Debts {
		user, err := u.ur.FindByID(ctx, d.UserID)
		if err != nil {
			span.RecordError(err)
			return nil, err
		}
		amount, err := domain.NewAmount(d.Amount)
		if err != nil {
			span.RecordError(err)
			return nil, err
		}
		debtor, err := domain.NewDebtor(user.ID(), user.Name(), user.Avatar(), user.Email(), amount)
		if err != nil {
			span.RecordError(err)
			return nil, err
		}
		err = u.dr.Create(ctx, event, payer, debtor)
		if err != nil {
			span.RecordError(err)
			return nil, err
		}
		debtors = append(debtors, debtor)
	}

	return &handler.CreateOutput{
		Event:   event,
		Debtors: debtors,
	}, nil
}

func (u LendingUseCaseImpl) Get(ctx context.Context, i handler.GetInput) (*handler.GetOutput, error) {
	ctx, span := tracer.Start(ctx, "lending.Get")
	defer span.End()

	payer, err := u.pr.FindByEventID(ctx, i.EventID)
	if err != nil {
		span.RecordError(err)
		return nil, err
	}

	if payer.ID() != i.UserID {
		return nil, fmt.Errorf("lendingEventが存在しません")
	}

	event, err := u.lr.FindByID(ctx, i.EventID)
	if err != nil {
		span.RecordError(err)
		return nil, err
	}

	debtors, err := u.dr.FindByEventID(ctx, i.EventID)
	if err != nil {
		span.RecordError(err)
		return nil, err
	}

	output := &handler.GetOutput{
		Event:   event,
		Debtors: debtors,
	}

	return output, nil
}

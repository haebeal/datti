package usecase

import (
	"context"
	"fmt"
	"slices"

	"github.com/haebeal/datti/internal/domain"
	"github.com/haebeal/datti/internal/presentation/api/handler"
	"go.opentelemetry.io/otel/codes"
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
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, err
	}
	event, err := domain.CreateLending(i.Name, eventAmount, i.EventDate)
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, err
	}
	err = u.lr.Create(ctx, event)
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, err
	}

	paidUser, err := u.ur.FindByID(ctx, i.UserID)
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, err
	}
	payer, err := domain.NewPayer(paidUser.ID(), paidUser.Name(), paidUser.Avatar(), paidUser.Email())
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, err
	}

	// 取引がないように更新しようとした時
	if len(i.Debts) == 0 {
		// TODO: カスタムエラー構造体が必要?
		err = fmt.Errorf("BadRequest Error")
		return nil, err
	}
	debtors := make([]*domain.Debtor, 0)
	for _, d := range i.Debts {
		user, err := u.ur.FindByID(ctx, d.UserID)
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
			return nil, err
		}
		amount, err := domain.NewAmount(d.Amount)
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
			return nil, err
		}
		debtor, err := domain.NewDebtor(user.ID(), user.Name(), user.Avatar(), user.Email(), amount)
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
			return nil, err
		}
		err = u.dr.Create(ctx, event, payer, debtor)
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
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
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, err
	}

	if payer.ID() != i.UserID {
		return nil, fmt.Errorf("lendingEventが存在しません")
	}

	event, err := u.lr.FindByID(ctx, i.EventID)
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, err
	}

	debtors, err := u.dr.FindByEventID(ctx, i.EventID)
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, err
	}

	output := &handler.GetOutput{
		Lending: event,
		Debtors: debtors,
	}

	return output, nil
}

func (u LendingUseCaseImpl) GetAll(ctx context.Context, i handler.GetAllInput) (*handler.GetAllOutput, error) {
	ctx, span := tracer.Start(ctx, "lending.GetAll")
	defer span.End()

	lendings, err := u.lr.FindByUserID(ctx, i.UserID)
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, fmt.Errorf("lendingEventが存在しません")
	}

	output := handler.GetAllOutput{}
	output.Lendings = append(output.Lendings, lendings...)
	return &output, nil
}

func (u LendingUseCaseImpl) Update(ctx context.Context, i handler.UpdateInput) (*handler.UpdateOutput, error) {
	ctx, span := tracer.Start(ctx, "lending.Update")
	defer span.End()

	payer, err := u.pr.FindByEventID(ctx, i.EventID)
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, err
	}

	if payer.ID() != i.UserID {
		// TODO: カスタムエラー構造体が必要?
		err = fmt.Errorf("forbidden Error")
		// NOTE: 正常系のためスパンステータスをエラーに設定しない
		return nil, err
	}

	// 取引がないように更新しようとした時
	if len(i.Debts) == 0 {
		// TODO: カスタムエラー構造体が必要?
		err = fmt.Errorf("BadRequest Error")
		return nil, err
	}

	lending, err := u.lr.FindByID(ctx, i.EventID)
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, err
	}

	var updatedDebtors []*domain.Debtor

	debtors, err := u.dr.FindByEventID(ctx, i.EventID)
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, err
	}

	for _, d := range debtors {
		idx := slices.IndexFunc(i.Debts, func(debts handler.DebtParam) bool {
			return d.ID() == debts.UserID
		})

		// debtorの削除
		if idx == -1 {
			err = u.dr.Delete(ctx, lending, d)
			if err != nil {
				span.SetStatus(codes.Error, err.Error())
				span.RecordError(err)
				return nil, err
			}
			continue
		}

		// debtorの更新
		amount, err := domain.NewAmount(i.Debts[idx].Amount)
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
			return nil, err
		}
		updatedDebtor, err := d.Update(amount)
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
			return nil, err
		}
		err = u.dr.Update(ctx, lending, updatedDebtor)
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
			return nil, err
		}
		updatedDebtors = append(updatedDebtors, updatedDebtor)
	}

	// debtorの作成
	for _, d := range i.Debts {
		exist := slices.ContainsFunc(debtors, func(debtor *domain.Debtor) bool {
			return debtor.ID() == d.UserID
		})
		if !exist {
			user, err := u.ur.FindByID(ctx, d.UserID)
			if err != nil {
				span.SetStatus(codes.Error, err.Error())
				span.RecordError(err)
				return nil, err
			}
			amount, err := domain.NewAmount(d.Amount)
			if err != nil {
				span.SetStatus(codes.Error, err.Error())
				span.RecordError(err)
				return nil, err
			}
			debtor, err := domain.NewDebtor(user.ID(), user.Name(), user.Avatar(), user.Email(), amount)
			if err != nil {
				span.SetStatus(codes.Error, err.Error())
				span.RecordError(err)
				return nil, err
			}
			err = u.dr.Create(ctx, lending, payer, debtor)
			if err != nil {
				span.SetStatus(codes.Error, err.Error())
				span.RecordError(err)
				return nil, err
			}
			updatedDebtors = append(updatedDebtors, debtor)
			continue
		}
	}

	eventAmount, err := domain.NewAmount(i.Amount)
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, err
	}
	updatedLending, err := lending.Update(i.Name, eventAmount, i.EventDate)
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, err
	}
	err = u.lr.Update(ctx, updatedLending)
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, err
	}

	return &handler.UpdateOutput{
		Lending: updatedLending,
		Debtors: updatedDebtors,
	}, nil
}

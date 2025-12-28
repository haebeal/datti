package usecase

import (
	"context"

	"github.com/haebeal/datti/internal/domain"
	"github.com/haebeal/datti/internal/presentation/api/handler"
	"github.com/oklog/ulid/v2"
	"go.opentelemetry.io/otel/codes"
)

type RepaymentUseCaseImpl struct {
	rr domain.RepaymentRepository
}

func NewRepaymentUseCase(rr domain.RepaymentRepository) RepaymentUseCaseImpl {
	return RepaymentUseCaseImpl{
		rr: rr,
	}
}

func (u RepaymentUseCaseImpl) Create(ctx context.Context, i handler.RepaymentCreateInput) (*handler.RepaymentCreateOutput, error) {
	ctx, span := tracer.Start(ctx, "repayment.Create")
	defer span.End()

	amount, err := domain.NewAmount(i.Amount)
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, err
	}

	repayment, err := domain.CreateRepayment(i.PayerID, i.DebtorID, amount)
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, err
	}

	err = u.rr.Create(ctx, repayment)
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, err
	}

	return &handler.RepaymentCreateOutput{
		Repayment: repayment,
	}, nil
}

func (u RepaymentUseCaseImpl) GetAll(ctx context.Context, i handler.RepaymentGetAllInput) (*handler.RepaymentGetAllOutput, error) {
	ctx, span := tracer.Start(ctx, "repayment.GetAll")
	defer span.End()

	repayments, err := u.rr.FindByPayerID(ctx, i.UserID)
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, err
	}

	return &handler.RepaymentGetAllOutput{
		Repayments: repayments,
	}, nil
}

func (u RepaymentUseCaseImpl) Get(ctx context.Context, i handler.RepaymentGetInput) (*handler.RepaymentGetOutput, error) {
	ctx, span := tracer.Start(ctx, "repayment.Get")
	defer span.End()

	id, err := ulid.Parse(i.ID)
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, err
	}

	repayment, err := u.rr.FindByID(ctx, id)
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, err
	}

	return &handler.RepaymentGetOutput{
		Repayment: repayment,
	}, nil
}

func (u RepaymentUseCaseImpl) Delete(ctx context.Context, i handler.RepaymentDeleteInput) error {
	ctx, span := tracer.Start(ctx, "repayment.Delete")
	defer span.End()

	id, err := ulid.Parse(i.ID)
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return err
	}

	err = u.rr.Delete(ctx, id)
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return err
	}

	return nil
}

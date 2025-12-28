package usecase

import (
	"context"

	"github.com/haebeal/datti/internal/domain"
	"github.com/haebeal/datti/internal/presentation/api/handler"
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

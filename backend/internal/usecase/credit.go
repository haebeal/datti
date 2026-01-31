package usecase

import (
	"context"

	"github.com/haebeal/datti/internal/domain"
	"github.com/haebeal/datti/internal/presentation/api/handler"
	"go.opentelemetry.io/otel/codes"
)

// CreditUseCaseImpl 債権/債務に関するユースケースの実装
type CreditUseCaseImpl struct {
	cr domain.CreditRepository
}

// NewCreditUseCase CreditUseCaseImplのファクトリ関数
func NewCreditUseCase(cr domain.CreditRepository) CreditUseCaseImpl {
	return CreditUseCaseImpl{
		cr: cr,
	}
}

// List 貸し借り一覧を取得する
func (u CreditUseCaseImpl) List(ctx context.Context, input handler.CreditListInput) (output *handler.CreditListOutput, err error) {
	ctx, span := tracer.Start(ctx, "usecase.Credit.List")
	defer func() {
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
		}
		span.End()
	}()

	credits, err := u.cr.FindByUserID(ctx, input.UserID)
	if err != nil {
		return nil, err
	}

	return &handler.CreditListOutput{
		Credits: credits,
	}, nil
}

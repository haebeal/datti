package usecase

import (
	"context"

	"github.com/haebeal/datti/internal/domain"
	"github.com/haebeal/datti/internal/presentation/api/handler"
	"github.com/oklog/ulid/v2"
	"go.opentelemetry.io/otel/codes"
)

// RepaymentUseCaseImpl 返済に関するユースケースの実装
type RepaymentUseCaseImpl struct {
	rr domain.RepaymentRepository
}

// NewRepaymentUseCase RepaymentUseCaseImplのファクトリ関数
func NewRepaymentUseCase(rr domain.RepaymentRepository) RepaymentUseCaseImpl {
	return RepaymentUseCaseImpl{
		rr: rr,
	}
}

// Create 返済を作成する
func (u RepaymentUseCaseImpl) Create(ctx context.Context, i handler.RepaymentCreateInput) (output *handler.RepaymentCreateOutput, err error) {
	ctx, span := tracer.Start(ctx, "usecase.Repayment.Create")
	defer func() {
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
		}
		span.End()
	}()

	repayment, err := domain.CreateRepayment(ctx, i.PayerID, i.DebtorID, i.Amount)
	if err != nil {
		return nil, err
	}

	if err := u.rr.Create(ctx, repayment); err != nil {
		return nil, err
	}

	return &handler.RepaymentCreateOutput{
		Repayment: repayment,
	}, nil
}

// Get 返済を取得する
func (u RepaymentUseCaseImpl) Get(ctx context.Context, i handler.RepaymentGetInput) (output *handler.RepaymentGetOutput, err error) {
	ctx, span := tracer.Start(ctx, "usecase.Repayment.Get")
	defer func() {
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
		}
		span.End()
	}()

	id, err := ulid.Parse(i.ID)
	if err != nil {
		return nil, err
	}

	repayment, err := u.rr.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	return &handler.RepaymentGetOutput{
		Repayment: repayment,
	}, nil
}

// GetByQuery 返済一覧を取得する
func (u RepaymentUseCaseImpl) GetByQuery(ctx context.Context, i handler.RepaymentGetByQueryInput) (output *handler.RepaymentGetByQueryOutput, err error) {
	ctx, span := tracer.Start(ctx, "usecase.Repayment.GetByQuery")
	defer func() {
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
		}
		span.End()
	}()

	limit := i.Limit
	repayments, err := u.rr.FindByPayerID(ctx, i.UserID, i.Cursor, &limit)
	if err != nil {
		return nil, err
	}

	result := handler.RepaymentGetByQueryOutput{
		Repayments: repayments,
	}

	// ページネーション情報の設定
	if len(repayments) > 0 && int32(len(repayments)) >= limit {
		lastID := repayments[len(repayments)-1].ID().String()
		result.NextCursor = &lastID
		result.HasMore = true
	}

	return &result, nil
}

// Update 返済を更新する
func (u RepaymentUseCaseImpl) Update(ctx context.Context, i handler.RepaymentUpdateInput) (output *handler.RepaymentUpdateOutput, err error) {
	ctx, span := tracer.Start(ctx, "usecase.Repayment.Update")
	defer func() {
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
		}
		span.End()
	}()

	id, err := ulid.Parse(i.ID)
	if err != nil {
		return nil, err
	}

	repayment, err := u.rr.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	updatedRepayment, err := repayment.Update(ctx, i.Amount)
	if err != nil {
		return nil, err
	}

	if err := u.rr.Update(ctx, updatedRepayment); err != nil {
		return nil, err
	}

	return &handler.RepaymentUpdateOutput{
		Repayment: updatedRepayment,
	}, nil
}

// Delete 返済を削除する
func (u RepaymentUseCaseImpl) Delete(ctx context.Context, i handler.RepaymentDeleteInput) (err error) {
	ctx, span := tracer.Start(ctx, "usecase.Repayment.Delete")
	defer func() {
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
		}
		span.End()
	}()

	id, err := ulid.Parse(i.ID)
	if err != nil {
		return err
	}

	return u.rr.Delete(ctx, id)
}

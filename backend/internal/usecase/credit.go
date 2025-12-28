package usecase

import (
    "context"

    "github.com/haebeal/datti/internal/domain"
    handler "github.com/haebeal/datti/internal/presentation/api/handler"
    "go.opentelemetry.io/otel/codes"
)

type CreditUseCaseImpl struct {
    repo domain.CreditRepository
}

func NewCreditUseCase(repo domain.CreditRepository) CreditUseCaseImpl {
    return CreditUseCaseImpl{repo: repo}
}

func (u CreditUseCaseImpl) List(ctx context.Context, input handler.CreditListInput) (*handler.CreditListOutput, error) {
    ctx, span := tracer.Start(ctx, "credit.List")
    defer span.End()

    lendings, err := u.repo.ListLendingCreditsByUserID(ctx, input.UserID)
    if err != nil {
        span.SetStatus(codes.Error, err.Error())
        span.RecordError(err)
        return nil, err
    }

    borrowings, err := u.repo.ListBorrowingCreditsByUserID(ctx, input.UserID)
    if err != nil {
        span.SetStatus(codes.Error, err.Error())
        span.RecordError(err)
        return nil, err
    }

    output := &handler.CreditListOutput{
        Lendings:   lendings,
        Borrowings: borrowings,
    }

    return output, nil
}

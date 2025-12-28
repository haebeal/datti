package usecase

import (
	"context"

	"github.com/haebeal/datti/internal/domain"
	"github.com/haebeal/datti/internal/presentation/api/handler"
	"go.opentelemetry.io/otel/codes"
)

type UserUseCaseImpl struct {
	ur domain.UserRepository
}

func NewUserUseCase(ur domain.UserRepository) UserUseCaseImpl {
	return UserUseCaseImpl{
		ur: ur,
	}
}

func (u UserUseCaseImpl) Search(ctx context.Context, input handler.UserSearchInput) (*handler.UserSearchOutput, error) {
	ctx, span := tracer.Start(ctx, "user.Search")
	defer span.End()

	limit := input.Limit
	if limit <= 0 {
		limit = 20
	}

	var name *string
	if input.Name != "" {
		name = &input.Name
	}
	var email *string
	if input.Email != "" {
		email = &input.Email
	}

	users, err := u.ur.FindBySearch(ctx, name, email, limit)
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, err
	}

	return &handler.UserSearchOutput{
		Users: users,
	}, nil
}

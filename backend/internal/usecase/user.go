package usecase

import (
	"context"
	"errors"

	"github.com/haebeal/datti/internal/domain"
	"github.com/haebeal/datti/internal/presentation/api/handler"
	"github.com/jackc/pgx/v5"
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

func (u UserUseCaseImpl) Get(ctx context.Context, input handler.UserGetInput) (*handler.UserGetOutput, error) {
	ctx, span := tracer.Start(ctx, "user.Get")
	defer span.End()

	user, err := u.ur.FindByID(ctx, input.ID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, handler.ErrUserNotFound
		}
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, err
	}

	return &handler.UserGetOutput{
		User: user,
	}, nil
}

func (u UserUseCaseImpl) GetMe(ctx context.Context, input handler.UserGetMeInput) (*handler.UserGetMeOutput, error) {
	ctx, span := tracer.Start(ctx, "user.GetMe")
	defer span.End()

	user, err := u.ur.FindByID(ctx, input.UID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, handler.ErrUserNotFound
		}
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, err
	}

	return &handler.UserGetMeOutput{
		User: user,
	}, nil
}

func (u UserUseCaseImpl) Update(ctx context.Context, input handler.UserUpdateInput) (*handler.UserUpdateOutput, error) {
	ctx, span := tracer.Start(ctx, "user.Update")
	defer span.End()

	// Check if user exists
	existingUser, err := u.ur.FindByID(ctx, input.ID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, handler.ErrUserNotFound
		}
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, err
	}

	// Create updated user (keep email unchanged)
	user, err := domain.NewUser(input.ID, input.Name, input.Avatar, existingUser.Email())
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, err
	}

	if err := u.ur.Update(ctx, user); err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, err
	}

	return &handler.UserUpdateOutput{
		User: user,
	}, nil
}

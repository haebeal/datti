package usecase

import (
	"context"
	"errors"

	"github.com/haebeal/datti/internal/domain"
	"github.com/haebeal/datti/internal/presentation/api/handler"
	"github.com/jackc/pgx/v5"
	"go.opentelemetry.io/otel/codes"
)

type AuthUseCaseImpl struct {
	ur domain.UserRepository
}

func NewAuthUseCase(ur domain.UserRepository) AuthUseCaseImpl {
	return AuthUseCaseImpl{
		ur: ur,
	}
}

func (a AuthUseCaseImpl) Login(ctx context.Context, input handler.AuthLoginInput) error {
	ctx, span := tracer.Start(ctx, "auth.Login")
	defer span.End()

	_, err := a.ur.FindByID(ctx, input.UID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return handler.ErrUserNotFound
		}
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return err
	}

	return nil
}

func (a AuthUseCaseImpl) Signup(ctx context.Context, input handler.AuthSignupInput) (*handler.AuthSignupOutput, error) {
	ctx, span := tracer.Start(ctx, "auth.Signup")
	defer span.End()

	// Check if user already exists
	_, err := a.ur.FindByID(ctx, input.UID)
	if err == nil {
		return nil, handler.ErrUserAlreadyExists
	}
	if !errors.Is(err, pgx.ErrNoRows) {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, err
	}

	// Create new user
	user, err := domain.NewUser(input.UID, input.Name, input.Avatar, input.Email)
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, err
	}

	if err := a.ur.Create(ctx, user); err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, err
	}

	return &handler.AuthSignupOutput{
		User: user,
	}, nil
}

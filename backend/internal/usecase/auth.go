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

	// Check if user already exists by UID
	_, err := a.ur.FindByID(ctx, input.UID)
	if err == nil {
		return nil, handler.ErrUserAlreadyExists
	}
	if !errors.Is(err, pgx.ErrNoRows) {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, err
	}

	// Check if user exists by email (for Firebase → Cognito migration)
	existingUser, err := a.ur.FindByEmail(ctx, input.Email)
	if err == nil {
		// Found existing user with same email - migrate ID
		if err := a.ur.UpdateID(ctx, existingUser.ID(), input.UID); err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
			return nil, err
		}

		// Return migrated user with new ID
		migratedUser, err := domain.NewUser(ctx, input.UID, existingUser.Name(), existingUser.Avatar(), existingUser.Email())
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
			return nil, err
		}
		return &handler.AuthSignupOutput{
			User: migratedUser,
		}, nil
	}
	if !errors.Is(err, pgx.ErrNoRows) {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, err
	}

	// Create new user
	user, err := domain.NewUser(ctx, input.UID, input.Name, input.Avatar, input.Email)
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

package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/haebeal/datti/internal/domain"
	"github.com/haebeal/datti/internal/gateway/postgres"
	"go.opentelemetry.io/otel/codes"
)

type UserRepositoryImpl struct {
	queries *postgres.Queries
}

func NewUserRepository(queries *postgres.Queries) *UserRepositoryImpl {
	return &UserRepositoryImpl{
		queries: queries,
	}
}

func (ur *UserRepositoryImpl) FindByID(ctx context.Context, id uuid.UUID) (*domain.User, error) {
	ctx, span := tracer.Start(ctx, "user.FindByID")
	defer span.End()

	ctx, querySpan := tracer.Start(ctx, "SELECT * FROM users WHERE id = $1 LIMIT 1")
	row, err := ur.queries.FindUserByID(ctx, id)
	if err != nil {
		querySpan.SetStatus(codes.Error, err.Error())
		querySpan.RecordError(err)
		querySpan.End()
		return nil, err
	}
	querySpan.End()

	user, err := domain.NewUser(row.ID.String(), row.Name, row.Avatar, row.Email)
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, err
	}

	return user, nil
}

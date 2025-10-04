package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/haebeal/datti/internal/domain"
	"github.com/haebeal/datti/internal/gateway/postgres"
)

type UserRepositoryImpl struct {
	ctx     context.Context
	queries *postgres.Queries
}

func NewUserRepository(ctx context.Context, queries *postgres.Queries) *UserRepositoryImpl {
	return &UserRepositoryImpl{
		ctx:     ctx,
		queries: queries,
	}
}

func (ur *UserRepositoryImpl) FindByID(ctx context.Context, id uuid.UUID) (*domain.User, error) {
	_, span := tracer.Start(ctx, "user.FindByID")
	defer span.End()

	_, querySpan := tracer.Start(ctx, "SELECT * FROM users WHERE id = $1 LIMIT 1")
	row, err := ur.queries.FindUserByID(ur.ctx, id)
	if err != nil {
		querySpan.RecordError(err)
		querySpan.End()
		return nil, err
	}
	querySpan.End()

	user, err := domain.NewUser(row.ID.String(), row.Name, row.Avatar, row.Email)
	if err != nil {
		span.RecordError(err)
		return nil, err
	}

	return user, nil
}

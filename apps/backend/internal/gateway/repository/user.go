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

func (ur *UserRepositoryImpl) FindByID(id uuid.UUID) (*domain.User, error) {
	row, err := ur.queries.FindUserByID(ur.ctx, id)
	if err != nil {
		return nil, err
	}

	user, err := domain.NewUser(row.ID.String(), row.Name, row.Avatar, row.Email)
	if err != nil {
		return nil, err
	}

	return user, nil
}

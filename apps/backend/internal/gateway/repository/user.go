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
	result, err := ur.queries.FindUserByID(ur.ctx, id)
	if err != nil {
		return nil, err
	}

	user, err := domain.NewUser(result.ID.String(), result.Name, result.Avatar, result.Email)
	if err != nil {
		return nil, err
	}

	return user, nil
}

func (ur *UserRepositoryImpl) FindAll() ([]*domain.User, error) {
	result, err := ur.queries.FindAllUsers(ur.ctx)
	if err != nil {
		return nil, err
	}

	var users []*domain.User
	for _, u := range result {
		user, err := domain.NewUser(u.ID.String(), u.Name, u.Avatar, u.Email)
		if err != nil {
			return nil, err
		}

		users = append(users, user)
	}

	return users, nil
}

func (ur *UserRepositoryImpl) Update(u *domain.User) error {
	err := ur.queries.UpdateUser(ur.ctx, postgres.UpdateUserParams{
		ID:     u.ID(),
		Name:   u.Name(),
		Avatar: u.Avatar(),
		Email:  u.Email(),
	})
	if err != nil {
		return err
	}

	return nil
}

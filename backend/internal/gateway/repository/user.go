package repository

import (
	"context"

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

func (ur *UserRepositoryImpl) FindByID(ctx context.Context, id string) (*domain.User, error) {
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

	user, err := domain.NewUser(row.ID, row.Name, row.Avatar, row.Email)
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, err
	}

	return user, nil
}

func (ur *UserRepositoryImpl) FindBySearch(ctx context.Context, name *string, email *string, limit int32) ([]*domain.User, error) {
	ctx, span := tracer.Start(ctx, "user.FindBySearch")
	defer span.End()

	ctx, querySpan := tracer.Start(ctx, "SELECT * FROM users WHERE name ILIKE $1 OR email ILIKE $2")
	rows, err := ur.queries.FindUsersBySearch(ctx, postgres.FindUsersBySearchParams{
		Name:  name,
		Email: email,
		Limit: limit,
	})
	if err != nil {
		querySpan.SetStatus(codes.Error, err.Error())
		querySpan.RecordError(err)
		querySpan.End()
		return nil, err
	}
	querySpan.End()

	users := make([]*domain.User, 0, len(rows))
	for _, row := range rows {
		user, err := domain.NewUser(row.ID, row.Name, row.Avatar, row.Email)
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
			return nil, err
		}
		users = append(users, user)
	}

	return users, nil
}

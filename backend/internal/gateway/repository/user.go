package repository

import (
	"context"
	"errors"

	"github.com/haebeal/datti/internal/domain"
	"github.com/haebeal/datti/internal/gateway/postgres"
	"github.com/jackc/pgx/v5"
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
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.NewNotFoundError("user", id)
		}
		return nil, err
	}
	querySpan.End()

	user, err := domain.NewUser(ctx, row.ID, row.Name, row.Avatar, row.Email)
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, err
	}

	return user, nil
}

func (ur *UserRepositoryImpl) FindByQuery(ctx context.Context, query domain.UserSearchQuery) ([]*domain.User, error) {
	ctx, span := tracer.Start(ctx, "user.FindByQuery")
	defer span.End()

	ctx, querySpan := tracer.Start(ctx, "SELECT * FROM users WHERE name ILIKE $1 OR email ILIKE $2")
	rows, err := ur.queries.FindUsersBySearch(ctx, postgres.FindUsersBySearchParams{
		Name:  query.Name,
		Email: query.Email,
		Limit: query.Limit,
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
		user, err := domain.NewUser(ctx, row.ID, row.Name, row.Avatar, row.Email)
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
			return nil, err
		}
		users = append(users, user)
	}

	return users, nil
}

func (ur *UserRepositoryImpl) Create(ctx context.Context, user *domain.User) error {
	ctx, span := tracer.Start(ctx, "user.Create")
	defer span.End()

	ctx, querySpan := tracer.Start(ctx, "INSERT INTO users (id, name, avatar, email)")
	err := ur.queries.CreateUser(ctx, postgres.CreateUserParams{
		ID:     user.ID(),
		Name:   user.Name(),
		Avatar: user.Avatar(),
		Email:  user.Email(),
	})
	if err != nil {
		querySpan.SetStatus(codes.Error, err.Error())
		querySpan.RecordError(err)
		querySpan.End()
		return err
	}
	querySpan.End()

	return nil
}

func (ur *UserRepositoryImpl) Update(ctx context.Context, user *domain.User) error {
	ctx, span := tracer.Start(ctx, "user.Update")
	defer span.End()

	ctx, querySpan := tracer.Start(ctx, "UPDATE users SET name = $2, avatar = $3")
	err := ur.queries.UpdateUser(ctx, postgres.UpdateUserParams{
		ID:     user.ID(),
		Name:   user.Name(),
		Avatar: user.Avatar(),
	})
	if err != nil {
		querySpan.SetStatus(codes.Error, err.Error())
		querySpan.RecordError(err)
		querySpan.End()
		return err
	}
	querySpan.End()

	return nil
}

func (ur *UserRepositoryImpl) FindByEmail(ctx context.Context, email string) (*domain.User, error) {
	ctx, span := tracer.Start(ctx, "user.FindByEmail")
	defer span.End()

	ctx, querySpan := tracer.Start(ctx, "SELECT * FROM users WHERE email = $1 LIMIT 1")
	row, err := ur.queries.FindUserByEmail(ctx, email)
	if err != nil {
		querySpan.SetStatus(codes.Error, err.Error())
		querySpan.RecordError(err)
		querySpan.End()
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.NewNotFoundError("user", email)
		}
		return nil, err
	}
	querySpan.End()

	user, err := domain.NewUser(ctx, row.ID, row.Name, row.Avatar, row.Email)
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, err
	}

	return user, nil
}

func (ur *UserRepositoryImpl) UpdateID(ctx context.Context, oldID, newID string) error {
	ctx, span := tracer.Start(ctx, "user.UpdateID")
	defer span.End()

	ctx, querySpan := tracer.Start(ctx, "UPDATE users SET id = $2 WHERE id = $1")
	err := ur.queries.UpdateUserID(ctx, postgres.UpdateUserIDParams{
		ID:   oldID,
		ID_2: newID,
	})
	if err != nil {
		querySpan.SetStatus(codes.Error, err.Error())
		querySpan.RecordError(err)
		querySpan.End()
		return err
	}
	querySpan.End()

	return nil
}

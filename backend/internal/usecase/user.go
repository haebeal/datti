package usecase

import (
	"context"

	"github.com/haebeal/datti/internal/domain"
	"github.com/haebeal/datti/internal/presentation/api/handler"
	"go.opentelemetry.io/otel/codes"
)

// UserUseCaseImpl ユーザーに関するユースケースの実装
type UserUseCaseImpl struct {
	ur domain.UserRepository
}

// NewUserUseCase UserUseCaseImplのファクトリ関数
func NewUserUseCase(ur domain.UserRepository) UserUseCaseImpl {
	return UserUseCaseImpl{
		ur: ur,
	}
}

// Search ユーザーを検索する
func (u UserUseCaseImpl) Search(ctx context.Context, input handler.UserSearchInput) (output *handler.UserSearchOutput, err error) {
	ctx, span := tracer.Start(ctx, "usecase.User.Search")
	defer func() {
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
		}
		span.End()
	}()

	query := domain.UserSearchQuery{
		Limit: 20, // デフォルト値
	}
	if input.Name != "" {
		query.Name = &input.Name
	}
	if input.Email != "" {
		query.Email = &input.Email
	}
	if input.Limit > 0 {
		query.Limit = input.Limit
	}

	users, err := u.ur.FindByQuery(ctx, query)
	if err != nil {
		return nil, err
	}

	return &handler.UserSearchOutput{
		Users: users,
	}, nil
}

// Get ユーザーを取得する
func (u UserUseCaseImpl) Get(ctx context.Context, input handler.UserGetInput) (output *handler.UserGetOutput, err error) {
	ctx, span := tracer.Start(ctx, "usecase.User.Get")
	defer func() {
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
		}
		span.End()
	}()

	user, err := u.ur.FindByID(ctx, input.ID)
	if err != nil {
		return nil, err
	}

	return &handler.UserGetOutput{
		User: user,
	}, nil
}

// GetMe 自分のユーザー情報を取得する
func (u UserUseCaseImpl) GetMe(ctx context.Context, input handler.UserGetMeInput) (output *handler.UserGetMeOutput, err error) {
	ctx, span := tracer.Start(ctx, "usecase.User.GetMe")
	defer func() {
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
		}
		span.End()
	}()

	user, err := u.ur.FindByID(ctx, input.UID)
	if err != nil {
		return nil, err
	}

	return &handler.UserGetMeOutput{
		User: user,
	}, nil
}

// UpdateMe 自分のプロフィールを更新する
func (u UserUseCaseImpl) UpdateMe(ctx context.Context, input handler.UserUpdateMeInput) (output *handler.UserUpdateMeOutput, err error) {
	ctx, span := tracer.Start(ctx, "usecase.User.UpdateMe")
	defer func() {
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
		}
		span.End()
	}()

	user, err := u.ur.FindByID(ctx, input.UID)
	if err != nil {
		return nil, err
	}

	updatedUser, err := user.UpdateProfile(ctx, input.Name, input.Avatar)
	if err != nil {
		return nil, err
	}

	err = u.ur.Update(ctx, updatedUser)
	if err != nil {
		return nil, err
	}

	return &handler.UserUpdateMeOutput{
		User: updatedUser,
	}, nil
}

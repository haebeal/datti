package usecase

import (
	"context"

	"github.com/haebeal/datti/internal/domain"
	"github.com/haebeal/datti/internal/gateway/line"
	"github.com/haebeal/datti/internal/presentation/api/handler"
	"go.opentelemetry.io/otel/codes"
)

// UserUseCaseImpl ユーザーに関するユースケースの実装
type UserUseCaseImpl struct {
	ur domain.UserRepository
	lc *line.Client
}

// NewUserUseCase UserUseCaseImplのファクトリ関数
func NewUserUseCase(ur domain.UserRepository, lc *line.Client) UserUseCaseImpl {
	return UserUseCaseImpl{
		ur: ur,
		lc: lc,
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

// LinkLINE LINE認可コードでアカウントを紐づける
func (u UserUseCaseImpl) LinkLINE(ctx context.Context, input handler.UserLinkLINEInput) (output *handler.UserLinkLINEOutput, err error) {
	ctx, span := tracer.Start(ctx, "usecase.User.LinkLINE")
	defer func() {
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
		}
		span.End()
	}()

	// LINE APIで認可コードからUser IDを取得
	lineUserID, err := u.lc.GetUserID(ctx, input.Code, input.RedirectURI)
	if err != nil {
		return nil, err
	}

	// 現在のユーザーを取得
	user, err := u.ur.FindByID(ctx, input.UID)
	if err != nil {
		return nil, err
	}

	// LINE User IDを紐づけた新しいエンティティを作成
	updatedUser, err := domain.NewUser(ctx, user.ID(), user.Name(), user.Avatar(), user.Email(), &lineUserID)
	if err != nil {
		return nil, err
	}

	if err := u.ur.Update(ctx, updatedUser); err != nil {
		return nil, err
	}

	return &handler.UserLinkLINEOutput{
		User: updatedUser,
	}, nil
}

// UnlinkLINE LINE連携を解除する
func (u UserUseCaseImpl) UnlinkLINE(ctx context.Context, input handler.UserUnlinkLINEInput) (err error) {
	ctx, span := tracer.Start(ctx, "usecase.User.UnlinkLINE")
	defer func() {
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
		}
		span.End()
	}()

	user, err := u.ur.FindByID(ctx, input.UID)
	if err != nil {
		return err
	}

	// LINE User IDをクリアした新しいエンティティを作成
	updatedUser, err := domain.NewUser(ctx, user.ID(), user.Name(), user.Avatar(), user.Email(), nil)
	if err != nil {
		return err
	}

	return u.ur.Update(ctx, updatedUser)
}

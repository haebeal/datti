package usecase

import (
	"context"
	"errors"

	"github.com/haebeal/datti/internal/domain"
	"github.com/haebeal/datti/internal/presentation/api/handler"
	"go.opentelemetry.io/otel/codes"
)

// AuthUseCaseImpl 認証に関するユースケースの実装
type AuthUseCaseImpl struct {
	ur domain.UserRepository
}

// NewAuthUseCase AuthUseCaseImplのファクトリ関数
func NewAuthUseCase(ur domain.UserRepository) AuthUseCaseImpl {
	return AuthUseCaseImpl{
		ur: ur,
	}
}

// Login ユーザーの存在確認を行う
func (a AuthUseCaseImpl) Login(ctx context.Context, input handler.AuthLoginInput) error {
	ctx, span := tracer.Start(ctx, "auth.Login")
	defer span.End()

	_, err := a.ur.FindByID(ctx, input.UID)
	if err != nil {
		// NotFoundErrorはそのまま返す（Handler層で処理）
		
		if errors.Is(err, &domain.NotFoundError{}) {
			return err
		}
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return err
	}

	return nil
}

// Signup ユーザー登録を行う
// 既存ユーザーとの重複チェック、Firebase→Cognito移行時のID更新を含む
func (a AuthUseCaseImpl) Signup(ctx context.Context, input handler.AuthSignupInput) (*handler.AuthSignupOutput, error) {
	ctx, span := tracer.Start(ctx, "auth.Signup")
	defer span.End()

	// UIDでユーザーの存在確認
	_, err := a.ur.FindByID(ctx, input.UID)
	if err == nil {
		return nil, domain.NewConflictError("user", "既にユーザーが存在します")
	}
	
	if !errors.Is(err, &domain.NotFoundError{}) {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, err
	}

	// メールアドレスでユーザーの存在確認（Firebase → Cognito移行用）
	existingUser, err := a.ur.FindByEmail(ctx, input.Email)
	if err == nil {
		// 同じメールアドレスのユーザーが見つかった場合、IDを移行
		if err := a.ur.UpdateID(ctx, existingUser.ID(), input.UID); err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
			return nil, err
		}

		// 新しいIDで移行済みユーザーを返す
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
	if !errors.Is(err, &domain.NotFoundError{}) {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, err
	}

	// 新規ユーザーを作成
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

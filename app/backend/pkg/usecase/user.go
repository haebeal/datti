package usecase

import (
	"context"

	"github.com/datti-api/pkg/domain/model"
	"github.com/datti-api/pkg/domain/repository"
	"github.com/google/uuid"
)

type UserUseCase interface {
	GetUsers(c context.Context, uid uuid.UUID) ([]*model.User, error)
	GetUserByUid(c context.Context, uid uuid.UUID, targetId uuid.UUID) (*model.User, string, error)
	GetUsersByEmail(c context.Context, uid uuid.UUID, email string, status string, cursor string, limit *int, getNext bool) ([]*model.UserStatus, *model.Cursor, error)
	GetUserStatus(c context.Context, uid uuid.UUID, fuid uuid.UUID) (*model.User, string, error)
	UpdateUser(c context.Context, uid uuid.UUID, name string, url string) (*model.User, error)
	SendFriendRequest(c context.Context, uid uuid.UUID, fuid uuid.UUID) error
	DeleteFriend(c context.Context, uid uuid.UUID, fuid uuid.UUID) error
}

type userUseCase struct {
	userRepository   repository.UserRepository
	friendRepository repository.FriendRepository
	transaction      repository.Transaction
}

const defaultLimit = 10

// GetUserByEmail implements UserUseCase.
func (u *userUseCase) GetUsersByEmail(c context.Context, uid uuid.UUID, email string, status string, inputCursor string, inputLimit *int, getNext bool) ([]*model.UserStatus, *model.Cursor, error) {
	var limit int

	if inputLimit == nil {
		limit = defaultLimit
	} else {
		limit = *inputLimit
	}

	users, cursor, err := u.userRepository.GetUsersByEmail(c, uid, email, status, inputCursor, limit, getNext)
	if err != nil {
		return nil, nil, err
	}

	return users, cursor, nil
}

// GetUserByUid implements UserUseCase.
func (u *userUseCase) GetUserByUid(c context.Context, uid uuid.UUID, targetId uuid.UUID) (*model.User, string, error) {
	user, err := u.userRepository.GetUserByUid(c, targetId)
	if err != nil {
		return nil, "", err
	}

	// フレンド状態のステータスを取得
	status, err := u.friendRepository.GetStatus(c, uid, user.ID)
	if err != nil {
		return nil, "", err
	}

	return user, status, nil
}

// GetUsers implements UserUseCase.
func (u *userUseCase) GetUsers(c context.Context, uid uuid.UUID) ([]*model.User, error) {
	users, err := u.userRepository.GetUsers(c)
	if err != nil {
		return nil, err
	}

	return users, nil
}

// GetUserStatus implements UserUseCase.
func (u *userUseCase) GetUserStatus(c context.Context, uid uuid.UUID, fuid uuid.UUID) (*model.User, string, error) {
	user, err := u.userRepository.GetUserByUid(c, fuid)
	if err != nil {
		return nil, "", err
	}
	if uid == fuid {
		return user, "me", nil
	}
	status, err := u.friendRepository.GetStatus(c, uid, fuid)
	if err != nil {
		return nil, "", err
	}

	return user, status, nil
}

// UpdateUser implements UserUseCase.
func (u *userUseCase) UpdateUser(c context.Context, uid uuid.UUID, name string, url string) (*model.User, error) {
	user, err := u.userRepository.UpdateUser(c, uid, name, url)
	if err != nil {
		return nil, err
	}

	return user, nil
}

// SendFriendRequest implements FriendUseCase.
func (u *userUseCase) SendFriendRequest(c context.Context, uid uuid.UUID, fuid uuid.UUID) error {
	if user, err := u.userRepository.GetUserByUid(c, fuid); err != nil {
		return err
	} else {
		_, err := u.transaction.DoInTx(c, func(ctx context.Context) (interface{}, error) {
			err := u.friendRepository.SetFriends(c, uid, user.ID)
			if err != nil {
				return nil, err
			}
			return nil, nil
		})
		if err != nil {
			return err
		}

		return nil
	}
}

// DeleteFriend implements FriendUseCase.
func (u *userUseCase) DeleteFriend(c context.Context, uid uuid.UUID, fuid uuid.UUID) error {
	_, err := u.transaction.DoInTx(c, func(ctx context.Context) (interface{}, error) {
		err := u.friendRepository.DeleteFriend(c, uid, fuid)
		if err != nil {
			return nil, err
		}
		return nil, nil
	})
	if err != nil {
		return err
	}

	return nil
}

func NewUserUseCase(userRepo repository.UserRepository, friendRepo repository.FriendRepository, tx repository.Transaction) UserUseCase {
	return &userUseCase{
		userRepository:   userRepo,
		friendRepository: friendRepo,
		transaction:      tx,
	}
}

package usecase

import (
	"context"
	"strings"

	"github.com/datti-api/pkg/domain/model"
	"github.com/datti-api/pkg/domain/repository"
)

type UserUseCase interface {
	GetUsers(c context.Context, uid string) ([]*model.User, error)
	GetUserByUid(c context.Context, uid string, targetId string) (*model.User, string, error)
	GetUsersByEmail(c context.Context, uid string, email string, status string) ([]*model.User, []string, error)
	GetUserStatus(c context.Context, uid string, fuid string) (*model.User, string, error)
	UpdateUser(c context.Context, uid string, name string, url string) (*model.User, error)
	SendFriendRequest(c context.Context, uid string, fuid string) error
	DeleteFriend(c context.Context, uid string, fuid string) error
}

type userUseCase struct {
	userRepository   repository.UserRepository
	friendRepository repository.FriendRepository
	transaction      repository.Transaction
}

// GetUserByEmail implements UserUseCase.
func (u *userUseCase) GetUsersByEmail(c context.Context, uid string, email string, status string) ([]*model.User, []string, error) {
	users, err := u.userRepository.GetUsers(c)
	if err != nil {
		return nil, nil, err
	}

	result := make([]*model.User, 0)
	statuses := make([]string, 0)

	for _, user := range users {
		s, err := u.friendRepository.GetStatus(c, uid, user.ID)
		if err != nil {
			return nil, nil, err
		}
		if strings.Contains(user.Email, email) && strings.Contains(s, status) {
			result = append(result, user)
			statuses = append(statuses, s)
		}
	}

	return result, statuses, nil
}

// GetUserByUid implements UserUseCase.
func (u *userUseCase) GetUserByUid(c context.Context, uid string, targetId string) (*model.User, string, error) {
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
func (u *userUseCase) GetUsers(c context.Context, uid string) ([]*model.User, error) {
	users, err := u.userRepository.GetUsers(c)
	if err != nil {
		return nil, err
	}

	return users, nil
}

// GetUserStatus implements UserUseCase.
func (u *userUseCase) GetUserStatus(c context.Context, uid string, fuid string) (*model.User, string, error) {
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
func (u *userUseCase) UpdateUser(c context.Context, uid string, name string, url string) (*model.User, error) {
	user, err := u.userRepository.UpdateUser(c, uid, name, url)
	if err != nil {
		return nil, err
	}

	return user, nil
}

// SendFriendRequest implements FriendUseCase.
func (u *userUseCase) SendFriendRequest(c context.Context, uid string, fuid string) error {
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
func (u *userUseCase) DeleteFriend(c context.Context, uid string, fuid string) error {
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

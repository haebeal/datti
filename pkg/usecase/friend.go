package usecase

import (
	"context"

	"github.com/datti-api/pkg/domain/model"
	"github.com/datti-api/pkg/domain/repository"
)

type FriendUseCase interface {
	GetFriends(c context.Context, uid string) ([]*model.User, error)
	GetApplyings(c context.Context, uid string) ([]*model.User, error)
	GetApplieds(c context.Context, uid string) ([]*model.User, error)
	SendFriendRequest(c context.Context, uid string, fuid string) error
	DeleteFriend(c context.Context, uid string, fuid string) error
}

type friendUsecase struct {
	friendRepository  repository.FriendRepository
	profielRepository repository.UserRepository
	transaction       repository.Transaction
}

// SendFriendRequest implements FriendUseCase.
func (f *friendUsecase) SendFriendRequest(c context.Context, uid string, fuid string) error {
	if u, err := f.profielRepository.GetUserByUid(c, fuid); err != nil {
		return err
	} else {
		_, err := f.transaction.DoInTx(c, func(ctx context.Context) (interface{}, error) {
			err := f.friendRepository.SetFriends(c, uid, u.UID)
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
func (f *friendUsecase) DeleteFriend(c context.Context, uid string, fuid string) error {
	_, err := f.transaction.DoInTx(c, func(ctx context.Context) (interface{}, error) {
		err := f.friendRepository.DeleteFriend(c, uid, fuid)
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

// GetApplieds implements FriendUseCase.
func (f *friendUsecase) GetApplieds(c context.Context, uid string) ([]*model.User, error) {
	v, err := f.transaction.DoInTx(c, func(ctx context.Context) (interface{}, error) {
		return f.friendRepository.GetApplieds(c, uid)
	})
	if err != nil {
		return nil, err
	}
	applieds := v.([]*model.Friend)
	users := make([]*model.User, 0)
	for _, applied := range applieds {
		user, err := f.profielRepository.GetUserByUid(c, applied.UID)
		if err != nil {
			return nil, err
		}
		users = append(users, user)
	}
	return users, nil
}

// GetApplyings implements FriendUseCase.
func (f *friendUsecase) GetApplyings(c context.Context, uid string) ([]*model.User, error) {
	v, err := f.transaction.DoInTx(c, func(ctx context.Context) (interface{}, error) {
		return f.friendRepository.GetApplyings(c, uid)
	})
	if err != nil {
		return nil, err
	}
	applyings := v.([]*model.Friend)
	users := make([]*model.User, 0)
	for _, applying := range applyings {
		user, err := f.profielRepository.GetUserByUid(c, applying.FUID)
		if err != nil {
			return nil, err
		}
		users = append(users, user)
	}
	return users, nil
}

// GetFriends implements FriendUseCase.
func (f *friendUsecase) GetFriends(c context.Context, uid string) ([]*model.User, error) {
	v, err := f.transaction.DoInTx(c, func(ctx context.Context) (interface{}, error) {
		return f.friendRepository.GetFriends(c, uid)
	})
	if err != nil {
		return nil, err
	}
	friends := v.([]*model.Friend)
	users := make([]*model.User, 0)
	for _, friend := range friends {
		user, err := f.profielRepository.GetUserByUid(c, friend.UID)
		if err != nil {
			return nil, err
		}
		users = append(users, user)
	}
	return users, nil
}

func NewFriendUseCase(fRepo repository.FriendRepository, uRepo repository.UserRepository, tx repository.Transaction) FriendUseCase {
	return &friendUsecase{
		friendRepository:  fRepo,
		profielRepository: uRepo,
		transaction:       tx,
	}
}

package usecase

import (
	"context"
	"database/sql"
	"errors"
	"strings"

	"github.com/datti-api/pkg/domain/model"
	"github.com/datti-api/pkg/domain/repository"
)

type UserUseCase interface {
	GetUsers(c context.Context, uid string) ([]*model.User, error)
	GetUserByUid(c context.Context, uid string, targetId string) (*model.User, string, *model.BankAccount, error)
	GetUsersByEmail(c context.Context, uid string, email string) ([]*model.User, []string, []*model.BankAccount, error)
	GetUserStatus(c context.Context, uid string, fuid string) (*model.User, string, error)
	UpdateUser(c context.Context, uid string, name string, url string, bankCode string, branchCode string, accountCode string) (*model.User, *model.BankAccount, error)
}

type userUseCase struct {
	userRepository   repository.UserRepository
	friendRepository repository.FriendRepository
	bankRepository   repository.BankAccountRepository
}

// GetUserByEmail implements UserUseCase.
func (u *userUseCase) GetUsersByEmail(c context.Context, uid string, email string) ([]*model.User, []string, []*model.BankAccount, error) {
	users, err := u.userRepository.GetUsers(c)
	if err != nil {
		return nil, nil, nil, err
	}

	usersWithEmail := make([]*model.User, 0)
	for _, user := range users {
		if strings.Contains(user.Email, email) {
			usersWithEmail = append(usersWithEmail, user)
		}
	}

	banks := make([]*model.BankAccount, 0)
	statuses := make([]string, 0)
	for _, user := range usersWithEmail {
		bank, err := u.bankRepository.GetBankAccountByUid(c, user.UID)
		if err != nil {
			if !(errors.Is(err, sql.ErrNoRows)) {
				return nil, nil, nil, err
			}
		}
		if bank != nil {
			banks = append(banks, bank)
		} else {
			banks = append(banks, new(model.BankAccount))
		}

		status, err := u.friendRepository.GetStatus(c, uid, user.UID)
		if err != nil {
			return nil, nil, nil, err
		}
		statuses = append(statuses, status)
	}

	return usersWithEmail, statuses, banks, nil
}

// GetUserByUid implements UserUseCase.
func (u *userUseCase) GetUserByUid(c context.Context, uid string, targetId string) (*model.User, string, *model.BankAccount, error) {
	user, err := u.userRepository.GetUserByUid(c, targetId)
	if err != nil {
		return nil, "", nil, err
	}

	// フレンド状態のステータスを取得
	status, err := u.friendRepository.GetStatus(c, uid, user.UID)
	if err != nil {
		return nil, "", nil, err
	}

	// userに紐づく講座情報の取得
	bank, err := u.bankRepository.GetBankAccountByUid(c, user.UID)
	if err != nil {
		if errors.Is(sql.ErrNoRows, err) {
			bank := new(model.BankAccount)
			return user, status, bank, nil
		}
		return nil, "", nil, err
	}

	return user, status, bank, nil
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
func (u *userUseCase) UpdateUser(c context.Context, uid string, name string, url string, bankCode string, branchCode string, accountCode string) (*model.User, *model.BankAccount, error) {
	user, err := u.userRepository.UpdateUser(c, uid, name, url)
	if err != nil {
		return nil, nil, err
	}
	bank, err := u.bankRepository.UpsertBankAccount(c, user.UID, accountCode, bankCode, branchCode)
	if err != nil {
		return nil, nil, err
	}
	return user, bank, nil
}

func NewUserUseCase(userRepo repository.UserRepository, friendRepo repository.FriendRepository, bankRepo repository.BankAccountRepository) UserUseCase {
	return &userUseCase{
		userRepository:   userRepo,
		friendRepository: friendRepo,
		bankRepository:   bankRepo,
	}
}

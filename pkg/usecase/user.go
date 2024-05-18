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
	GetUserByUid(c context.Context, uid string) (*model.User, *model.BankAccount, error)
	GetUsersByEmail(c context.Context, email string) ([]*model.User, []*model.BankAccount, error)
	GetUserStatus(c context.Context, uid string, fuid string) (*model.User, string, error)
	UpdateUser(c context.Context, uid string, name string, url string, bankCode string, branchCode string, accountCode string) (*model.User, *model.BankAccount, error)
}

type userUseCase struct {
	userRepository   repository.UserRepository
	friendRepository repository.FriendRepository
	bankRepository   repository.BankAccountRepository
}

// GetUserByEmail implements UserUseCase.
func (u *userUseCase) GetUsersByEmail(c context.Context, email string) ([]*model.User, []*model.BankAccount, error) {
	users, err := u.userRepository.GetUsers(c)
	if err != nil {
		return nil, nil, err
	}
	usersWithEmail := make([]*model.User, 0)
	for _, user := range users {
		if strings.Contains(user.Email, email) {
			usersWithEmail = append(usersWithEmail, user)
		}
	}

	banks := make([]*model.BankAccount, 0)
	for _, user := range usersWithEmail {
		bank, err := u.bankRepository.GetBankAccountByUid(c, user.UID)
		if err != nil {
			if !(errors.Is(err, sql.ErrNoRows)) {
				return nil, nil, err
			}
		}
		if bank != nil {
			banks = append(banks, bank)
		} else {
			banks = append(banks, new(model.BankAccount))
		}
	}

	return usersWithEmail, banks, nil
}

// GetUserByUid implements UserUseCase.
func (u *userUseCase) GetUserByUid(c context.Context, uid string) (*model.User, *model.BankAccount, error) {
	user, err := u.userRepository.GetUserByUid(c, uid)
	if err != nil {
		return nil, nil, err
	}
	// userに紐づく講座情報の取得
	bank, err := u.bankRepository.GetBankAccountByUid(c, user.UID)
	if err != nil {
		if errors.Is(sql.ErrNoRows, err) {
			bank := new(model.BankAccount)
			return user, bank, nil
		}
		return nil, nil, err
	}
	return user, bank, nil
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
	status, err := u.friendRepository.GetStatus(c, uid, fuid)
	if err != nil {
		return nil, "", err
	}

	user, err := u.userRepository.GetUserByUid(c, fuid)
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

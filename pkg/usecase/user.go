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
	UpdateUser(c context.Context, uid string, name string, url string, bankCode string, branchCode string, accountCode string) (*model.User, *model.BankAccount, error)
}

type userUseCase struct {
	userRepository repository.UserRepository
	bankRepository repository.BankAccountRepository
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

func NewUserUseCase(userRepo repository.UserRepository, bankRepo repository.BankAccountRepository) UserUseCase {
	return &userUseCase{
		userRepository: userRepo,
		bankRepository: bankRepo,
	}
}

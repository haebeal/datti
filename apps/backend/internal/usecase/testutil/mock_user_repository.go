package testutil

import (
	"errors"

	"github.com/google/uuid"
	"github.com/haebeal/datti/internal/domain"
)

// MockUserRepository はUserRepositoryのモック実装
type MockUserRepository struct {
	Users map[uuid.UUID]*domain.User
	Err   error
}

func (m *MockUserRepository) FindByID(id uuid.UUID) (*domain.User, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	if user, exists := m.Users[id]; exists {
		return user, nil
	}
	return nil, errors.New("user not found")
}

func (m *MockUserRepository) FindAll() ([]*domain.User, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	var users []*domain.User
	for _, user := range m.Users {
		users = append(users, user)
	}
	return users, nil
}

func (m *MockUserRepository) Update(user *domain.User) error {
	return m.Err
}
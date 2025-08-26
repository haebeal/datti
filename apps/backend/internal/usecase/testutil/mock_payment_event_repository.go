package testutil

import (
	"errors"

	"github.com/haebeal/datti/internal/domain"
)

// MockPaymentEventRepository はPaymentEventRepositoryのモック実装
type MockPaymentEventRepository struct {
	Events []*domain.PaymentEvent
	Err    error
}

func (m *MockPaymentEventRepository) Create(event *domain.PaymentEvent) error {
	if m.Err != nil {
		return m.Err
	}
	m.Events = append(m.Events, event)
	return nil
}

func (m *MockPaymentEventRepository) FindAll() ([]*domain.PaymentEvent, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	return m.Events, nil
}

func (m *MockPaymentEventRepository) FindByID(id string) (*domain.PaymentEvent, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	for _, event := range m.Events {
		if event.ID().String() == id {
			return event, nil
		}
	}
	return nil, errors.New("payment event not found")
}

func (m *MockPaymentEventRepository) Update(event *domain.PaymentEvent) error {
	return m.Err
}

func (m *MockPaymentEventRepository) Delete(event *domain.PaymentEvent) error {
	return m.Err
}
package usecase

import (
	"errors"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/haebeal/datti/internal/domain"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// モックリポジトリ実装
type mockUserRepository struct {
	users map[uuid.UUID]*domain.User
	err   error
}

func (m *mockUserRepository) FindByID(id uuid.UUID) (*domain.User, error) {
	if m.err != nil {
		return nil, m.err
	}
	if user, exists := m.users[id]; exists {
		return user, nil
	}
	return nil, errors.New("user not found")
}

func (m *mockUserRepository) FindAll() ([]*domain.User, error) {
	if m.err != nil {
		return nil, m.err
	}
	var users []*domain.User
	for _, user := range m.users {
		users = append(users, user)
	}
	return users, nil
}

func (m *mockUserRepository) Update(user *domain.User) error {
	return m.err
}

type mockPaymentEventRepository struct {
	events []*domain.PaymentEvent
	err    error
}

func (m *mockPaymentEventRepository) Create(event *domain.PaymentEvent) error {
	if m.err != nil {
		return m.err
	}
	m.events = append(m.events, event)
	return nil
}

func (m *mockPaymentEventRepository) FindAll() ([]*domain.PaymentEvent, error) {
	if m.err != nil {
		return nil, m.err
	}
	return m.events, nil
}

func (m *mockPaymentEventRepository) FindByID(id string) (*domain.PaymentEvent, error) {
	if m.err != nil {
		return nil, m.err
	}
	for _, event := range m.events {
		if event.ID().String() == id {
			return event, nil
		}
	}
	return nil, errors.New("payment event not found")
}

func (m *mockPaymentEventRepository) Update(event *domain.PaymentEvent) error {
	return m.err
}

func (m *mockPaymentEventRepository) Delete(event *domain.PaymentEvent) error {
	return m.err
}

func TestPaymentUseCase_Create_Success(t *testing.T) {
	// テスト用ユーザー作成
	payerID := uuid.New()
	debtorID := uuid.New()

	payer, err := domain.NewUser(payerID.String(), "Payer User", "https://example.com/avatar1.jpg", "payer@example.com")
	require.NoError(t, err, "Failed to create payer")

	debtor, err := domain.NewUser(debtorID.String(), "Debtor User", "https://example.com/avatar2.jpg", "debtor@example.com")
	require.NoError(t, err, "Failed to create debtor")

	// モックリポジトリセットアップ
	userRepo := &mockUserRepository{
		users: map[uuid.UUID]*domain.User{
			payerID:  payer,
			debtorID: debtor,
		},
	}
	paymentRepo := &mockPaymentEventRepository{}

	// ユースケース作成
	uc := NewPaymentUseCase(paymentRepo, userRepo)

	// テスト実行
	input := CreatePaymentInput{
		Name:    "Test Payment",
		PayerID: payerID,
		Amount:  1000,
		Debtors: []DebtorParam{
			{ID: debtorID, Amount: 500},
		},
		EventDate: time.Now(),
	}

	result, err := uc.Create(input)

	// 検証
	assert.NoError(t, err)
	assert.NotNil(t, result)
	assert.Equal(t, "Test Payment", result.Name())
	assert.Len(t, paymentRepo.events, 1)
}

func TestPaymentUseCase_Create_PayerNotFound(t *testing.T) {
	// テスト用ユーザー作成
	debtorID := uuid.New()
	debtor, err := domain.NewUser(debtorID.String(), "Debtor User", "https://example.com/avatar2.jpg", "debtor@example.com")
	require.NoError(t, err, "Failed to create debtor")

	// モックリポジトリセットアップ（payerは存在しない）
	userRepo := &mockUserRepository{
		users: map[uuid.UUID]*domain.User{
			debtorID: debtor,
		},
	}
	paymentRepo := &mockPaymentEventRepository{}

	// ユースケース作成
	uc := NewPaymentUseCase(paymentRepo, userRepo)

	// テスト実行
	nonExistentPayerID := uuid.New()
	input := CreatePaymentInput{
		Name:    "Test Payment",
		PayerID: nonExistentPayerID,
		Amount:  1000,
		Debtors: []DebtorParam{
			{ID: debtorID, Amount: 500},
		},
		EventDate: time.Now(),
	}

	result, err := uc.Create(input)

	// 検証
	assert.Error(t, err)
	assert.Nil(t, result)
}

func TestPaymentUseCase_Create_InvalidAmount(t *testing.T) {
	// テスト用ユーザー作成
	payerID := uuid.New()
	payer, err := domain.NewUser(payerID.String(), "Payer User", "https://example.com/avatar1.jpg", "payer@example.com")
	require.NoError(t, err, "Failed to create payer")

	// モックリポジトリセットアップ
	userRepo := &mockUserRepository{
		users: map[uuid.UUID]*domain.User{
			payerID: payer,
		},
	}
	paymentRepo := &mockPaymentEventRepository{}

	// ユースケース作成
	uc := NewPaymentUseCase(paymentRepo, userRepo)

	// テスト実行（無効な金額）
	input := CreatePaymentInput{
		Name:      "Test Payment",
		PayerID:   payerID,
		Amount:    -100, // 負の金額
		Debtors:   []DebtorParam{},
		EventDate: time.Now(),
	}

	result, err := uc.Create(input)

	// 検証
	assert.Error(t, err)
	assert.Nil(t, result)
}

func TestPaymentUseCase_Create_RepositoryError(t *testing.T) {
	// テスト用ユーザー作成
	payerID := uuid.New()
	debtorID := uuid.New()

	payer, err := domain.NewUser(payerID.String(), "Payer User", "https://example.com/avatar1.jpg", "payer@example.com")
	require.NoError(t, err, "Failed to create payer")

	debtor, err := domain.NewUser(debtorID.String(), "Debtor User", "https://example.com/avatar2.jpg", "debtor@example.com")
	require.NoError(t, err, "Failed to create debtor")

	// モックリポジトリセットアップ（保存エラーを発生させる）
	userRepo := &mockUserRepository{
		users: map[uuid.UUID]*domain.User{
			payerID:  payer,
			debtorID: debtor,
		},
	}
	paymentRepo := &mockPaymentEventRepository{
		err: errors.New("database error"),
	}

	// ユースケース作成
	uc := NewPaymentUseCase(paymentRepo, userRepo)

	// テスト実行
	input := CreatePaymentInput{
		Name:    "Test Payment",
		PayerID: payerID,
		Amount:  1000,
		Debtors: []DebtorParam{
			{ID: debtorID, Amount: 500},
		},
		EventDate: time.Now(),
	}

	result, err := uc.Create(input)

	// 検証
	assert.Error(t, err)
	assert.Nil(t, result)
}
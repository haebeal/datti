package usecase

import (
	"errors"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/haebeal/datti/internal/domain"
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
	if err != nil {
		t.Fatalf("Failed to create payer: %v", err)
	}

	debtor, err := domain.NewUser(debtorID.String(), "Debtor User", "https://example.com/avatar2.jpg", "debtor@example.com")
	if err != nil {
		t.Fatalf("Failed to create debtor: %v", err)
	}

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
	if err != nil {
		t.Errorf("Expected no error, got: %v", err)
	}
	if result == nil {
		t.Error("Expected result to not be nil")
	}
	if result.Name() != "Test Payment" {
		t.Errorf("Expected event name 'Test Payment', got: %s", result.Name())
	}
	if len(paymentRepo.events) != 1 {
		t.Errorf("Expected 1 event to be saved, got: %d", len(paymentRepo.events))
	}
}

func TestPaymentUseCase_Create_PayerNotFound(t *testing.T) {
	// テスト用ユーザー作成
	debtorID := uuid.New()
	debtor, err := domain.NewUser(debtorID.String(), "Debtor User", "https://example.com/avatar2.jpg", "debtor@example.com")
	if err != nil {
		t.Fatalf("Failed to create debtor: %v", err)
	}

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
	if err == nil {
		t.Error("Expected error for non-existent payer, got nil")
	}
	if result != nil {
		t.Error("Expected result to be nil when payer not found")
	}
}

func TestPaymentUseCase_Create_InvalidAmount(t *testing.T) {
	// テスト用ユーザー作成
	payerID := uuid.New()
	payer, err := domain.NewUser(payerID.String(), "Payer User", "https://example.com/avatar1.jpg", "payer@example.com")
	if err != nil {
		t.Fatalf("Failed to create payer: %v", err)
	}

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
	if err == nil {
		t.Error("Expected error for invalid amount, got nil")
	}
	if result != nil {
		t.Error("Expected result to be nil when amount is invalid")
	}
}

func TestPaymentUseCase_Create_RepositoryError(t *testing.T) {
	// テスト用ユーザー作成
	payerID := uuid.New()
	debtorID := uuid.New()

	payer, err := domain.NewUser(payerID.String(), "Payer User", "https://example.com/avatar1.jpg", "payer@example.com")
	if err != nil {
		t.Fatalf("Failed to create payer: %v", err)
	}

	debtor, err := domain.NewUser(debtorID.String(), "Debtor User", "https://example.com/avatar2.jpg", "debtor@example.com")
	if err != nil {
		t.Fatalf("Failed to create debtor: %v", err)
	}

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
	if err == nil {
		t.Error("Expected error from repository, got nil")
	}
	if result != nil {
		t.Error("Expected result to be nil when repository error occurs")
	}
}
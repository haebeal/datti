package usecase

import (
	"errors"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/haebeal/datti/internal/domain"
	"github.com/haebeal/datti/internal/usecase/testutil"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)


func TestPaymentUseCase_Create_Success(t *testing.T) {
	// テスト用ユーザー作成
	payerID := uuid.New()
	debtorID := uuid.New()

	payer, err := domain.NewUser(payerID.String(), "Payer User", "https://example.com/avatar1.jpg", "payer@example.com")
	require.NoError(t, err, "Failed to create payer")

	debtor, err := domain.NewUser(debtorID.String(), "Debtor User", "https://example.com/avatar2.jpg", "debtor@example.com")
	require.NoError(t, err, "Failed to create debtor")

	// モックリポジトリセットアップ
	userRepo := &testutil.MockUserRepository{
		Users: map[uuid.UUID]*domain.User{
			payerID:  payer,
			debtorID: debtor,
		},
	}
	paymentRepo := &testutil.MockPaymentEventRepository{}

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
	assert.Len(t, paymentRepo.Events, 1)
}

func TestPaymentUseCase_Create_PayerNotFound(t *testing.T) {
	// テスト用ユーザー作成
	debtorID := uuid.New()
	debtor, err := domain.NewUser(debtorID.String(), "Debtor User", "https://example.com/avatar2.jpg", "debtor@example.com")
	require.NoError(t, err, "Failed to create debtor")

	// モックリポジトリセットアップ（payerは存在しない）
	userRepo := &testutil.MockUserRepository{
		Users: map[uuid.UUID]*domain.User{
			debtorID: debtor,
		},
	}
	paymentRepo := &testutil.MockPaymentEventRepository{}

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
	userRepo := &testutil.MockUserRepository{
		Users: map[uuid.UUID]*domain.User{
			payerID: payer,
		},
	}
	paymentRepo := &testutil.MockPaymentEventRepository{}

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
	userRepo := &testutil.MockUserRepository{
		Users: map[uuid.UUID]*domain.User{
			payerID:  payer,
			debtorID: debtor,
		},
	}
	paymentRepo := &testutil.MockPaymentEventRepository{
		Err: errors.New("database error"),
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
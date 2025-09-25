package usecase

import (
	"errors"
	"testing"
	"time"

	"github.com/golang/mock/gomock"
	"github.com/google/uuid"
	"github.com/haebeal/datti/internal/domain"
	"github.com/haebeal/datti/internal/usecase/testutil"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestPaymentUseCase_Create_Success(t *testing.T) {
	// gomockコントローラー作成
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	// テスト用ユーザー作成
	payerID := uuid.New()
	debtorID := uuid.New()

	payer, err := domain.NewUser(payerID.String(), "Payer User", "https://example.com/avatar1.jpg", "payer@example.com")
	require.NoError(t, err, "Failed to create payer")

	debtor, err := domain.NewUser(debtorID.String(), "Debtor User", "https://example.com/avatar2.jpg", "debtor@example.com")
	require.NoError(t, err, "Failed to create debtor")

	// モックリポジトリセットアップ
	userRepo := testutil.NewMockUserRepository(ctrl)
	paymentRepo := testutil.NewMockPaymentEventRepository(ctrl)

	// モックの期待値設定
	userRepo.EXPECT().FindByID(payerID).Return(payer, nil)
	userRepo.EXPECT().FindByID(debtorID).Return(debtor, nil)
	paymentRepo.EXPECT().Create(gomock.Any()).Return(nil)

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
}

func TestPaymentUseCase_Create_PayerNotFound(t *testing.T) {
	// gomockコントローラー作成
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	// モックリポジトリセットアップ
	userRepo := testutil.NewMockUserRepository(ctrl)
	paymentRepo := testutil.NewMockPaymentEventRepository(ctrl)

	// モックの期待値設定（payerが見つからない）
	nonExistentPayerID := uuid.New()
	userRepo.EXPECT().FindByID(nonExistentPayerID).Return(nil, errors.New("user not found"))

	// ユースケース作成
	uc := NewPaymentUseCase(paymentRepo, userRepo)

	// テスト実行
	debtorID := uuid.New()
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

func TestPaymentUseCase_Create_NoDebtors(t *testing.T) {
	// gomockコントローラー作成
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	// モックリポジトリセットアップ
	userRepo := testutil.NewMockUserRepository(ctrl)
	paymentRepo := testutil.NewMockPaymentEventRepository(ctrl)

	// PayerIDを生成（実際にはユーザー検索前にAmount検証でエラーになる）
	payerID := uuid.New()

	// モックの期待値設定（debtorは空のためpayerのみ用意）
	payer, err := domain.NewUser(payerID.String(), "Payer User", "https://example.com/avatar1.jpg", "payer@example.com")
	require.NoError(t, err, "Failed to create payer")
	userRepo.EXPECT().FindByID(payerID).Return(payer, nil)

	// ユースケース作成
	uc := NewPaymentUseCase(paymentRepo, userRepo)

	// テスト実行（debtorsが空）
	input := CreatePaymentInput{
		Name:      "Test Payment",
		PayerID:   payerID,
		Amount:    1000,
		Debtors:   []DebtorParam{},
		EventDate: time.Now(),
	}

	result, err := uc.Create(input)

	// 検証
	assert.Error(t, err)
	assert.Nil(t, result)
}

func TestPaymentUseCase_Create_RepositoryError(t *testing.T) {
	// gomockコントローラー作成
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	// テスト用ユーザー作成
	payerID := uuid.New()
	debtorID := uuid.New()

	payer, err := domain.NewUser(payerID.String(), "Payer User", "https://example.com/avatar1.jpg", "payer@example.com")
	require.NoError(t, err, "Failed to create payer")

	debtor, err := domain.NewUser(debtorID.String(), "Debtor User", "https://example.com/avatar2.jpg", "debtor@example.com")
	require.NoError(t, err, "Failed to create debtor")

	// モックリポジトリセットアップ
	userRepo := testutil.NewMockUserRepository(ctrl)
	paymentRepo := testutil.NewMockPaymentEventRepository(ctrl)

	// モックの期待値設定（保存エラーを発生させる）
	userRepo.EXPECT().FindByID(payerID).Return(payer, nil)
	userRepo.EXPECT().FindByID(debtorID).Return(debtor, nil)
	paymentRepo.EXPECT().Create(gomock.Any()).Return(errors.New("database error"))

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

func TestPaymentUseCase_Get_Success(t *testing.T) {
	// gomockコントローラー作成
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	// モックデーターの作成
	payerID := uuid.New()
	payerUser, err := domain.NewUser(payerID.String(), "Payer User", "https://example.com/avatar1.jpg", "payer@example.com")
	require.NoError(t, err, "Failed to create payer user")
	payerAmount, err := domain.NewAmount(1000)
	require.NoError(t, err, "Failed to create payer amount")
	payer, err := domain.NewPayer(payerUser, payerAmount)
	require.NoError(t, err, "Failed to create payer")

	debtorID := uuid.New()
	debtorUser, err := domain.NewUser(debtorID.String(), "Debtor User", "https://example.com/avatar2.jpg", "debtor@example.com")
	require.NoError(t, err, "Failed to create debtor user")
	debtorAmount, err := domain.NewAmount(500)
	require.NoError(t, err, "Failed to create debtor amount")
	debtor, err := domain.NewDebtor(debtorUser, debtorAmount)
	require.NoError(t, err, "Failed to create debtor")

	eventDate := time.Now()
	event, err := domain.CreatePaymentEvent("Test Event", payer, []*domain.Debtor{debtor}, eventDate)
	require.NoError(t, err, "Failed to create event")

	userRepo := testutil.NewMockUserRepository(ctrl)
	paymentRepo := testutil.NewMockPaymentEventRepository(ctrl)
	paymentRepo.EXPECT().FindByID(event.ID().String()).Return(event, nil)

	uc := NewPaymentUseCase(paymentRepo, userRepo)

	input := GetPaymentInput{
		ID: event.ID().String(),
	}
	result, err := uc.Get(input)

	assert.NoError(t, err)
	assert.NotNil(t, result)
	assert.Equal(t, event, result)
}

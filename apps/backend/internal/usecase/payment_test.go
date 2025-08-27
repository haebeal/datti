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


// テストケース構造体
type paymentCreateTestCase struct {
	name       string
	setupMocks func() (*testutil.MockUserRepository, *testutil.MockPaymentEventRepository)
	input      CreatePaymentInput
	wantErr    bool
	assertions func(t *testing.T, result *domain.PaymentEvent, mockRepo *testutil.MockPaymentEventRepository)
}

// 正常系テストケース
func successTestCase() paymentCreateTestCase {
	payerID := uuid.New()
	debtorID := uuid.New()

	return paymentCreateTestCase{
		name: "success case",
		setupMocks: func() (*testutil.MockUserRepository, *testutil.MockPaymentEventRepository) {
			payer, _ := domain.NewUser(payerID.String(), "Payer User", "https://example.com/avatar1.jpg", "payer@example.com")
			debtor, _ := domain.NewUser(debtorID.String(), "Debtor User", "https://example.com/avatar2.jpg", "debtor@example.com")

			userRepo := &testutil.MockUserRepository{
				Users: map[uuid.UUID]*domain.User{
					payerID:  payer,
					debtorID: debtor,
				},
			}
			paymentRepo := &testutil.MockPaymentEventRepository{}
			return userRepo, paymentRepo
		},
		input: CreatePaymentInput{
			Name:    "Test Payment",
			PayerID: payerID,
			Amount:  1000,
			Debtors: []DebtorParam{
				{ID: debtorID, Amount: 500},
			},
			EventDate: time.Now(),
		},
		wantErr: false,
		assertions: func(t *testing.T, result *domain.PaymentEvent, mockRepo *testutil.MockPaymentEventRepository) {
			assert.NotNil(t, result)
			assert.Equal(t, "Test Payment", result.Name())
			assert.Len(t, mockRepo.Events, 1)
		},
	}
}

// Payerが見つからないテストケース
func payerNotFoundTestCase() paymentCreateTestCase {
	debtorID := uuid.New()
	nonExistentPayerID := uuid.New()

	return paymentCreateTestCase{
		name: "payer not found",
		setupMocks: func() (*testutil.MockUserRepository, *testutil.MockPaymentEventRepository) {
			debtor, _ := domain.NewUser(debtorID.String(), "Debtor User", "https://example.com/avatar2.jpg", "debtor@example.com")

			userRepo := &testutil.MockUserRepository{
				Users: map[uuid.UUID]*domain.User{
					debtorID: debtor,
				},
			}
			paymentRepo := &testutil.MockPaymentEventRepository{}
			return userRepo, paymentRepo
		},
		input: CreatePaymentInput{
			Name:    "Test Payment",
			PayerID: nonExistentPayerID,
			Amount:  1000,
			Debtors: []DebtorParam{
				{ID: debtorID, Amount: 500},
			},
			EventDate: time.Now(),
		},
		wantErr: true,
		assertions: func(t *testing.T, result *domain.PaymentEvent, mockRepo *testutil.MockPaymentEventRepository) {
			assert.Nil(t, result)
		},
	}
}

// 無効な金額テストケース
func invalidAmountTestCase() paymentCreateTestCase {
	payerID := uuid.New()

	return paymentCreateTestCase{
		name: "invalid amount",
		setupMocks: func() (*testutil.MockUserRepository, *testutil.MockPaymentEventRepository) {
			payer, _ := domain.NewUser(payerID.String(), "Payer User", "https://example.com/avatar1.jpg", "payer@example.com")

			userRepo := &testutil.MockUserRepository{
				Users: map[uuid.UUID]*domain.User{
					payerID: payer,
				},
			}
			paymentRepo := &testutil.MockPaymentEventRepository{}
			return userRepo, paymentRepo
		},
		input: CreatePaymentInput{
			Name:      "Test Payment",
			PayerID:   payerID,
			Amount:    -100, // 負の金額
			Debtors:   []DebtorParam{},
			EventDate: time.Now(),
		},
		wantErr: true,
		assertions: func(t *testing.T, result *domain.PaymentEvent, mockRepo *testutil.MockPaymentEventRepository) {
			assert.Nil(t, result)
		},
	}
}

// リポジトリエラーテストケース
func repositoryErrorTestCase() paymentCreateTestCase {
	payerID := uuid.New()
	debtorID := uuid.New()

	return paymentCreateTestCase{
		name: "repository error",
		setupMocks: func() (*testutil.MockUserRepository, *testutil.MockPaymentEventRepository) {
			payer, _ := domain.NewUser(payerID.String(), "Payer User", "https://example.com/avatar1.jpg", "payer@example.com")
			debtor, _ := domain.NewUser(debtorID.String(), "Debtor User", "https://example.com/avatar2.jpg", "debtor@example.com")

			userRepo := &testutil.MockUserRepository{
				Users: map[uuid.UUID]*domain.User{
					payerID:  payer,
					debtorID: debtor,
				},
			}
			paymentRepo := &testutil.MockPaymentEventRepository{
				Err: errors.New("database error"),
			}
			return userRepo, paymentRepo
		},
		input: CreatePaymentInput{
			Name:    "Test Payment",
			PayerID: payerID,
			Amount:  1000,
			Debtors: []DebtorParam{
				{ID: debtorID, Amount: 500},
			},
			EventDate: time.Now(),
		},
		wantErr: true,
		assertions: func(t *testing.T, result *domain.PaymentEvent, mockRepo *testutil.MockPaymentEventRepository) {
			assert.Nil(t, result)
		},
	}
}

// 支払いイベント登録のテスト関数
func TestPaymentUseCase_Create(t *testing.T) {
	testCases := []paymentCreateTestCase{
		successTestCase(),
		payerNotFoundTestCase(),
		invalidAmountTestCase(),
		repositoryErrorTestCase(),
	}

	for _, tt := range testCases {
		t.Run(tt.name, func(t *testing.T) {
			// モックセットアップ
			userRepo, paymentRepo := tt.setupMocks()

			// ユースケース作成
			uc := NewPaymentUseCase(paymentRepo, userRepo)

			// テスト実行
			result, err := uc.Create(tt.input)

			// エラー検証
			if tt.wantErr {
				assert.Error(t, err)
			} else {
				require.NoError(t, err)
			}

			// カスタムアサーション実行
			if tt.assertions != nil {
				tt.assertions(t, result, paymentRepo)
			}
		})
	}
}

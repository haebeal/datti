package domain

import (
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/oklog/ulid/v2"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestNewPaymentEvent(t *testing.T) {
	// テスト用の基本データを準備
	validID := ulid.Make().String()
	validName := "test payment event"
	validEventDate := time.Now()
	validCreatedAt := time.Now()
	validUpdatedAt := time.Now()

	// テスト用のユーザーを作成
	user1, _ := NewUser(uuid.New().String(), "user1", "https://example.com/avatar1.jpg", "user1@example.com")
	user2, _ := NewUser(uuid.New().String(), "user2", "https://example.com/avatar2.jpg", "user2@example.com")
	user3, _ := NewUser(uuid.New().String(), "user3", "https://example.com/avatar3.jpg", "user3@example.com")

	// テスト用の金額を作成
	amount1000, _ := NewAmount(1000)
	amount500, _ := NewAmount(500)

	// 有効なPayerを作成
	validPayer, _ := NewPayer(user1, amount1000)

	// 有効なDebtorリストを作成
	debtor1, _ := NewDebtor(user2, amount500)
	debtor2, _ := NewDebtor(user3, amount500)
	validDebtors := []*Debtor{debtor1, debtor2}

	// エラーケース用：PayerがDebtorに含まれるパターン
	payerAsDebtor, _ := NewDebtor(user1, amount500)
	debtorsWithPayer := []*Debtor{payerAsDebtor, debtor2}

	// エラーケース用：重複するDebtorパターン
	duplicateDebtor, _ := NewDebtor(user2, amount500)
	duplicateDebtors := []*Debtor{debtor1, duplicateDebtor}

	// テーブル駆動テストのテストケース定義
	tests := []struct {
		name        string
		id          string
		eventName   string
		payer       *Payer
		debtors     []*Debtor
		eventDate   time.Time
		createdAt   time.Time
		updatedAt   time.Time
		wantErr     bool
		errContains string
	}{
		{
			// 正常系：全てのパラメータが有効な場合
			name:      "valid case",
			id:        validID,
			eventName: validName,
			payer:     validPayer,
			debtors:   validDebtors,
			eventDate: validEventDate,
			createdAt: validCreatedAt,
			updatedAt: validUpdatedAt,
			wantErr:   false,
		},
		{
			// 異常系：無効なULID形式のIDを渡した場合
			name:        "invalid id",
			id:          "invalid-ulid",
			eventName:   validName,
			payer:       validPayer,
			debtors:     validDebtors,
			eventDate:   validEventDate,
			createdAt:   validCreatedAt,
			updatedAt:   validUpdatedAt,
			wantErr:     true,
		},
		{
			// 異常系：イベント名が空文字列の場合
			name:        "empty event name",
			id:          validID,
			eventName:   "",
			payer:       validPayer,
			debtors:     validDebtors,
			eventDate:   validEventDate,
			createdAt:   validCreatedAt,
			updatedAt:   validUpdatedAt,
			wantErr:     true,
			errContains: "name length must be greater than 0",
		},
		{
			// 異常系：債務者リストが空の場合
			name:        "empty debtors",
			id:          validID,
			eventName:   validName,
			payer:       validPayer,
			debtors:     []*Debtor{},
			eventDate:   validEventDate,
			createdAt:   validCreatedAt,
			updatedAt:   validUpdatedAt,
			wantErr:     true,
			errContains: "debtors length must be greater than 0",
		},
		{
			// 異常系：支払い者が債務者リストに含まれている場合
			name:        "payer in debtors",
			id:          validID,
			eventName:   validName,
			payer:       validPayer,
			debtors:     debtorsWithPayer,
			eventDate:   validEventDate,
			createdAt:   validCreatedAt,
			updatedAt:   validUpdatedAt,
			wantErr:     true,
			errContains: "payer must not be a debtor",
		},
		{
			// 異常系：債務者リストに重複するユーザーが含まれている場合
			name:        "duplicate debtor",
			id:          validID,
			eventName:   validName,
			payer:       validPayer,
			debtors:     duplicateDebtors,
			eventDate:   validEventDate,
			createdAt:   validCreatedAt,
			updatedAt:   validUpdatedAt,
			wantErr:     true,
			errContains: "duplicate debtor",
		},
		{
			// 異常系：更新日が作成日より前の場合
			name:        "updated_at before created_at",
			id:          validID,
			eventName:   validName,
			payer:       validPayer,
			debtors:     validDebtors,
			eventDate:   validEventDate,
			createdAt:   validCreatedAt,
			updatedAt:   validCreatedAt.Add(-time.Hour),
			wantErr:     true,
			errContains: "updatedAt must not be before createdAt",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := NewPaymentEvent(tt.id, tt.eventName, tt.payer, tt.debtors, tt.eventDate, tt.createdAt, tt.updatedAt)
			
			if tt.wantErr {
				assert.Error(t, err)
				if tt.errContains != "" {
					assert.Contains(t, err.Error(), tt.errContains)
				}
				return
			}
			
			require.NoError(t, err)
			require.NotNil(t, got)
			assert.Equal(t, tt.eventName, got.Name())
			assert.True(t, got.Payer().Equal(tt.payer.User))
			assert.Len(t, got.Debtors(), len(tt.debtors))
		})
	}
}

func TestCreatePaymentEvent(t *testing.T) {
	// テスト用の基本データを準備
	validName := "test payment event"
	validEventDate := time.Now()

	// テスト用のユーザーを作成
	user1, _ := NewUser(uuid.New().String(), "user1", "https://example.com/avatar1.jpg", "user1@example.com")
	user2, _ := NewUser(uuid.New().String(), "user2", "https://example.com/avatar2.jpg", "user2@example.com")

	// テスト用の金額を作成
	amount1000, _ := NewAmount(1000)
	amount500, _ := NewAmount(500)

	// 有効なPayerとDebtorを作成
	validPayer, _ := NewPayer(user1, amount1000)
	debtor1, _ := NewDebtor(user2, amount500)
	validDebtors := []*Debtor{debtor1}

	// テーブル駆動テストのテストケース定義
	tests := []struct {
		name        string
		eventName   string
		payer       *Payer
		debtors     []*Debtor
		eventDate   time.Time
		wantErr     bool
		errContains string
	}{
		{
			// 正常系：有効なパラメータでPaymentEventを作成
			name:      "valid case",
			eventName: validName,
			payer:     validPayer,
			debtors:   validDebtors,
			eventDate: validEventDate,
			wantErr:   false,
		},
		{
			// 異常系：イベント名が空文字列の場合
			name:        "empty event name",
			eventName:   "",
			payer:       validPayer,
			debtors:     validDebtors,
			eventDate:   validEventDate,
			wantErr:     true,
			errContains: "name length must be greater than 0",
		},
		{
			// 異常系：債務者リストが空の場合
			name:        "empty debtors",
			eventName:   validName,
			payer:       validPayer,
			debtors:     []*Debtor{},
			eventDate:   validEventDate,
			wantErr:     true,
			errContains: "debtors length must be greater than 0",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := CreatePaymentEvent(tt.eventName, tt.payer, tt.debtors, tt.eventDate)
			
			if tt.wantErr {
				assert.Error(t, err)
				if tt.errContains != "" {
					assert.Contains(t, err.Error(), tt.errContains)
				}
				return
			}
			
			require.NoError(t, err)
			require.NotNil(t, got)
			assert.Equal(t, tt.eventName, got.Name())
			assert.NotEmpty(t, got.ID().String())
		})
	}
}

func TestPaymentEvent_Update(t *testing.T) {
	// 初期データ用のユーザー作成
	user1, _ := NewUser(uuid.New().String(), "user1", "https://example.com/avatar1.jpg", "user1@example.com")
	user2, _ := NewUser(uuid.New().String(), "user2", "https://example.com/avatar2.jpg", "user2@example.com")
	user3, _ := NewUser(uuid.New().String(), "user3", "https://example.com/avatar3.jpg", "user3@example.com")

	// テスト用の金額を作成
	amount1000, _ := NewAmount(1000)
	amount500, _ := NewAmount(500)

	// 初期のPaymentEvent作成用データ
	payer, _ := NewPayer(user1, amount1000)
	debtor1, _ := NewDebtor(user2, amount500)
	debtor2, _ := NewDebtor(user3, amount500)
	debtors := []*Debtor{debtor1, debtor2}

	// 更新テスト用の元となるPaymentEventを作成
	originalEvent, _ := CreatePaymentEvent("original event", payer, debtors, time.Now())

	// 更新用の新しいデータを準備
	newPayer, _ := NewPayer(user2, amount1000)
	newDebtor, _ := NewDebtor(user3, amount500)
	newDebtors := []*Debtor{newDebtor}

	// エラーケース用：PayerがDebtorに含まれるパターン
	payerAsDebtor, _ := NewDebtor(user2, amount500)
	debtorsWithPayer := []*Debtor{payerAsDebtor}

	// テーブル駆動テストのテストケース定義
	tests := []struct {
		name        string
		eventName   string
		payer       *Payer
		debtors     []*Debtor
		eventDate   time.Time
		wantErr     bool
		errContains string
	}{
		{
			// 正常系：有効なパラメータでPaymentEventを更新
			name:      "valid update",
			eventName: "updated event",
			payer:     newPayer,
			debtors:   newDebtors,
			eventDate: time.Now(),
			wantErr:   false,
		},
		{
			// 異常系：イベント名が空文字列の場合
			name:        "empty event name",
			eventName:   "",
			payer:       newPayer,
			debtors:     newDebtors,
			eventDate:   time.Now(),
			wantErr:     true,
			errContains: "name length must be greater than 0",
		},
		{
			// 異常系：支払い者が債務者リストに含まれている場合
			name:        "payer in debtors",
			eventName:   "updated event",
			payer:       newPayer,
			debtors:     debtorsWithPayer,
			eventDate:   time.Now(),
			wantErr:     true,
			errContains: "payer must not be a debtor",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := originalEvent.Update(tt.eventName, tt.payer, tt.debtors, tt.eventDate)
			
			if tt.wantErr {
				assert.Error(t, err)
				if tt.errContains != "" {
					assert.Contains(t, err.Error(), tt.errContains)
				}
				return
			}
			
			require.NoError(t, err)
			require.NotNil(t, got)
			assert.Equal(t, tt.eventName, got.Name())
			assert.Equal(t, originalEvent.ID(), got.ID())
			assert.True(t, got.CreatedAt().Equal(originalEvent.CreatedAt()))
			assert.True(t, got.UpdatedAt().After(originalEvent.UpdatedAt()))
		})
	}
}

func TestPaymentEvent_Getters(t *testing.T) {
	// テスト用のユーザーを作成
	user1, _ := NewUser(uuid.New().String(), "user1", "https://example.com/avatar1.jpg", "user1@example.com")
	user2, _ := NewUser(uuid.New().String(), "user2", "https://example.com/avatar2.jpg", "user2@example.com")

	// テスト用の金額を作成
	amount1000, _ := NewAmount(1000)
	amount500, _ := NewAmount(500)

	// テスト用のPayerとDebtorを作成
	payer, _ := NewPayer(user1, amount1000)
	debtor, _ := NewDebtor(user2, amount500)
	debtors := []*Debtor{debtor}

	// Getterテスト用のPaymentEventを作成
	eventDate := time.Now()
	event, err := CreatePaymentEvent("test event", payer, debtors, eventDate)
	require.NoError(t, err, "Failed to create test event")

	// ID()メソッドのテスト：生成されたIDが空でないことを確認
	t.Run("ID getter", func(t *testing.T) {
		id := event.ID()
		assert.NotEmpty(t, id.String())
	})

	// Name()メソッドのテスト：設定されたイベント名が正しく取得できることを確認
	t.Run("Name getter", func(t *testing.T) {
		name := event.Name()
		assert.Equal(t, "test event", name)
	})

	// Payer()メソッドのテスト：設定された支払い者が正しく取得できることを確認
	t.Run("Payer getter", func(t *testing.T) {
		gotPayer := event.Payer()
		assert.True(t, gotPayer.Equal(payer.User))
	})

	// Debtors()メソッドのテスト：設定された債務者リストが正しく取得できることを確認
	t.Run("Debtors getter", func(t *testing.T) {
		gotDebtors := event.Debtors()
		assert.Len(t, gotDebtors, len(debtors))
	})

	// EventDate()メソッドのテスト：設定されたイベント日時が正しく取得できることを確認
	t.Run("EventDate getter", func(t *testing.T) {
		gotEventDate := event.EventDate()
		assert.True(t, gotEventDate.Equal(eventDate))
	})

	// CreatedAt()メソッドのテスト：作成日時が設定されていることを確認
	t.Run("CreatedAt getter", func(t *testing.T) {
		createdAt := event.CreatedAt()
		assert.False(t, createdAt.IsZero())
	})

	// UpdatedAt()メソッドのテスト：更新日時が設定されていることを確認
	t.Run("UpdatedAt getter", func(t *testing.T) {
		updatedAt := event.UpdatedAt()
		assert.False(t, updatedAt.IsZero())
	})
}
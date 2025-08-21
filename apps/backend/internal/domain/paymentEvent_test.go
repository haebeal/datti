package domain

import (
	"strings"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/oklog/ulid/v2"
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
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := NewPaymentEvent(tt.id, tt.eventName, tt.payer, tt.debtors, tt.eventDate, tt.createdAt, tt.updatedAt)
			
			if tt.wantErr {
				if err == nil {
					t.Errorf("NewPaymentEvent() error = nil, wantErr %v", tt.wantErr)
					return
				}
				if tt.errContains != "" && !strings.Contains(err.Error(), tt.errContains) {
					t.Errorf("NewPaymentEvent() error = %v, want error containing %v", err, tt.errContains)
				}
				return
			}
			
			if err != nil {
				t.Errorf("NewPaymentEvent() error = %v, wantErr %v", err, tt.wantErr)
				return
			}

			if got == nil {
				t.Errorf("NewPaymentEvent() got = nil, want non-nil")
				return
			}

			if got.Name() != tt.eventName {
				t.Errorf("NewPaymentEvent() name = %v, want %v", got.Name(), tt.eventName)
			}

			if !got.Payer().Equal(tt.payer.User) {
				t.Errorf("NewPaymentEvent() payer = %v, want %v", got.Payer(), tt.payer)
			}

			if len(got.Debtors()) != len(tt.debtors) {
				t.Errorf("NewPaymentEvent() debtors length = %v, want %v", len(got.Debtors()), len(tt.debtors))
			}
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
				if err == nil {
					t.Errorf("CreatePaymentEvent() error = nil, wantErr %v", tt.wantErr)
					return
				}
				if tt.errContains != "" && !strings.Contains(err.Error(), tt.errContains) {
					t.Errorf("CreatePaymentEvent() error = %v, want error containing %v", err, tt.errContains)
				}
				return
			}
			
			if err != nil {
				t.Errorf("CreatePaymentEvent() error = %v, wantErr %v", err, tt.wantErr)
				return
			}

			if got == nil {
				t.Errorf("CreatePaymentEvent() got = nil, want non-nil")
				return
			}

			if got.Name() != tt.eventName {
				t.Errorf("CreatePaymentEvent() name = %v, want %v", got.Name(), tt.eventName)
			}

			if got.ID().String() == "" {
				t.Errorf("CreatePaymentEvent() ID should not be empty")
			}
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
				if err == nil {
					t.Errorf("Update() error = nil, wantErr %v", tt.wantErr)
					return
				}
				if tt.errContains != "" && !strings.Contains(err.Error(), tt.errContains) {
					t.Errorf("Update() error = %v, want error containing %v", err, tt.errContains)
				}
				return
			}
			
			if err != nil {
				t.Errorf("Update() error = %v, wantErr %v", err, tt.wantErr)
				return
			}

			if got == nil {
				t.Errorf("Update() got = nil, want non-nil")
				return
			}

			if got.Name() != tt.eventName {
				t.Errorf("Update() name = %v, want %v", got.Name(), tt.eventName)
			}

			if got.ID() != originalEvent.ID() {
				t.Errorf("Update() ID should not change")
			}

			if !got.CreatedAt().Equal(originalEvent.CreatedAt()) {
				t.Errorf("Update() CreatedAt should not change")
			}

			if !got.UpdatedAt().After(originalEvent.UpdatedAt()) {
				t.Errorf("Update() UpdatedAt should be after original")
			}
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
	if err != nil {
		t.Fatalf("Failed to create test event: %v", err)
	}

	// ID()メソッドのテスト：生成されたIDが空でないことを確認
	t.Run("ID getter", func(t *testing.T) {
		id := event.ID()
		if id.String() == "" {
			t.Errorf("ID() should not be empty")
		}
	})

	// Name()メソッドのテスト：設定されたイベント名が正しく取得できることを確認
	t.Run("Name getter", func(t *testing.T) {
		name := event.Name()
		if name != "test event" {
			t.Errorf("Name() = %v, want %v", name, "test event")
		}
	})

	// Payer()メソッドのテスト：設定された支払い者が正しく取得できることを確認
	t.Run("Payer getter", func(t *testing.T) {
		gotPayer := event.Payer()
		if !gotPayer.Equal(payer.User) {
			t.Errorf("Payer() = %v, want %v", gotPayer, payer)
		}
	})

	// Debtors()メソッドのテスト：設定された債務者リストが正しく取得できることを確認
	t.Run("Debtors getter", func(t *testing.T) {
		gotDebtors := event.Debtors()
		if len(gotDebtors) != len(debtors) {
			t.Errorf("Debtors() length = %v, want %v", len(gotDebtors), len(debtors))
		}
	})

	// EventDate()メソッドのテスト：設定されたイベント日時が正しく取得できることを確認
	t.Run("EventDate getter", func(t *testing.T) {
		gotEventDate := event.EventDate()
		if !gotEventDate.Equal(eventDate) {
			t.Errorf("EventDate() = %v, want %v", gotEventDate, eventDate)
		}
	})

	// CreatedAt()メソッドのテスト：作成日時が設定されていることを確認
	t.Run("CreatedAt getter", func(t *testing.T) {
		createdAt := event.CreatedAt()
		if createdAt.IsZero() {
			t.Errorf("CreatedAt() should not be zero")
		}
	})

	// UpdatedAt()メソッドのテスト：更新日時が設定されていることを確認
	t.Run("UpdatedAt getter", func(t *testing.T) {
		updatedAt := event.UpdatedAt()
		if updatedAt.IsZero() {
			t.Errorf("UpdatedAt() should not be zero")
		}
	})
}
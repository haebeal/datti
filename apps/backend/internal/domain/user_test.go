package domain

import (
	"strings"
	"testing"

	"github.com/google/uuid"
)

func TestNewUser(t *testing.T) {
	// テスト用の基本データを準備
	validID := uuid.New().String()
	validName := "test user"
	validAvatar := "https://example.com/avatar.jpg"
	validEmail := "test@example.com"

	// テーブル駆動テストのテストケース定義
	tests := []struct {
		name        string
		id          string
		userName    string
		avatar      string
		email       string
		wantErr     bool
		errContains string
	}{
		{
			// 正常系：全てのパラメータが有効な場合
			name:     "valid case",
			id:       validID,
			userName: validName,
			avatar:   validAvatar,
			email:    validEmail,
			wantErr:  false,
		},
		{
			// 異常系：無効なUUID形式のIDを渡した場合
			name:     "invalid uuid",
			id:       "invalid-uuid",
			userName: validName,
			avatar:   validAvatar,
			email:    validEmail,
			wantErr:  true,
		},
		{
			// 異常系：ユーザー名が空文字列の場合
			name:        "empty name",
			id:          validID,
			userName:    "",
			avatar:      validAvatar,
			email:       validEmail,
			wantErr:     true,
			errContains: "name length must be greater than 0",
		},
		{
			// 異常系：無効なURL形式のアバターを渡した場合
			name:        "invalid avatar url",
			id:          validID,
			userName:    validName,
			avatar:      "invalid-url",
			email:       validEmail,
			wantErr:     true,
			errContains: "invalid avatar URL: scheme and host are required",
		},
		{
			// 異常系：無効なメールアドレス形式を渡した場合
			name:     "invalid email",
			id:       validID,
			userName: validName,
			avatar:   validAvatar,
			email:    "invalid-email",
			wantErr:  true,
		},
		{
			// 正常系：日本語の名前
			name:     "japanese name",
			id:       validID,
			userName: "テストユーザー",
			avatar:   validAvatar,
			email:    validEmail,
			wantErr:  false,
		},
		{
			// 正常系：長い名前
			name:     "long name",
			id:       validID,
			userName: "very long user name with many characters",
			avatar:   validAvatar,
			email:    validEmail,
			wantErr:  false,
		},
		{
			// 正常系：HTTPSではないアバターURL
			name:     "http avatar url",
			id:       validID,
			userName: validName,
			avatar:   "http://example.com/avatar.jpg",
			email:    validEmail,
			wantErr:  false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := NewUser(tt.id, tt.userName, tt.avatar, tt.email)

			if tt.wantErr {
				if err == nil {
					t.Errorf("NewUser() error = nil, wantErr %v", tt.wantErr)
					return
				}
				if tt.errContains != "" && !strings.Contains(err.Error(), tt.errContains) {
					t.Errorf("NewUser() error = %v, want error containing %v", err, tt.errContains)
				}
				return
			}

			if err != nil {
				t.Errorf("NewUser() error = %v, wantErr %v", err, tt.wantErr)
				return
			}

			if got == nil {
				t.Errorf("NewUser() got = nil, want non-nil")
				return
			}

			if got.Name() != tt.userName {
				t.Errorf("NewUser() name = %v, want %v", got.Name(), tt.userName)
			}

			if got.Avatar() != tt.avatar {
				t.Errorf("NewUser() avatar = %v, want %v", got.Avatar(), tt.avatar)
			}

			if got.Email() != tt.email {
				t.Errorf("NewUser() email = %v, want %v", got.Email(), tt.email)
			}

			expectedUUID, _ := uuid.Parse(tt.id)
			if got.ID() != expectedUUID {
				t.Errorf("NewUser() id = %v, want %v", got.ID(), expectedUUID)
			}
		})
	}
}

func TestUser_Equal(t *testing.T) {
	// 同じIDのユーザーを作成
	sameID := uuid.New().String()
	user1, _ := NewUser(sameID, "user1", "https://example.com/avatar1.jpg", "user1@example.com")
	user2, _ := NewUser(sameID, "user2", "https://example.com/avatar2.jpg", "user2@example.com")

	// 異なるIDのユーザーを作成
	user3, _ := NewUser(uuid.New().String(), "user3", "https://example.com/avatar3.jpg", "user3@example.com")

	tests := []struct {
		name   string
		user1  *User
		user2  *User
		want   bool
	}{
		{
			name:  "same id users are equal",
			user1: user1,
			user2: user2,
			want:  true,
		},
		{
			name:  "different id users are not equal",
			user1: user1,
			user2: user3,
			want:  false,
		},
		{
			name:  "user equals itself",
			user1: user1,
			user2: user1,
			want:  true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := tt.user1.Equal(tt.user2)
			if got != tt.want {
				t.Errorf("User.Equal() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestUser_Getters(t *testing.T) {
	// テスト用のユーザーを作成
	testID := uuid.New().String()
	testName := "test user"
	testAvatar := "https://example.com/avatar.jpg"
	testEmail := "test@example.com"

	user, err := NewUser(testID, testName, testAvatar, testEmail)
	if err != nil {
		t.Fatalf("Failed to create test user: %v", err)
	}

	// ID()メソッドのテスト
	t.Run("ID getter", func(t *testing.T) {
		expectedUUID, _ := uuid.Parse(testID)
		id := user.ID()
		if id != expectedUUID {
			t.Errorf("ID() = %v, want %v", id, expectedUUID)
		}
	})

	// Name()メソッドのテスト
	t.Run("Name getter", func(t *testing.T) {
		name := user.Name()
		if name != testName {
			t.Errorf("Name() = %v, want %v", name, testName)
		}
	})

	// Avatar()メソッドのテスト
	t.Run("Avatar getter", func(t *testing.T) {
		avatar := user.Avatar()
		if avatar != testAvatar {
			t.Errorf("Avatar() = %v, want %v", avatar, testAvatar)
		}
	})

	// Email()メソッドのテスト
	t.Run("Email getter", func(t *testing.T) {
		email := user.Email()
		if email != testEmail {
			t.Errorf("Email() = %v, want %v", email, testEmail)
		}
	})
}
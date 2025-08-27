package domain

import (
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
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
			name:     "empty name",
			id:       validID,
			userName: "",
			avatar:   validAvatar,
			email:    validEmail,
			wantErr:     true,
			errContains: "name length must be greater than 0",
		},
		{
			// 異常系：無効なURL形式のアバターを渡した場合
			name:     "invalid avatar url",
			id:       validID,
			userName: validName,
			avatar:   "invalid-url",
			email:    validEmail,
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
				assert.Error(t, err)
				if tt.errContains != "" {
					assert.Contains(t, err.Error(), tt.errContains)
				}
				return
			}

			require.NoError(t, err)
			require.NotNil(t, got)

			assert.Equal(t, tt.userName, got.Name())
			assert.Equal(t, tt.avatar, got.Avatar())
			assert.Equal(t, tt.email, got.Email())

			expectedUUID, _ := uuid.Parse(tt.id)
			assert.Equal(t, expectedUUID, got.ID())
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
		name  string
		user1 *User
		user2 *User
		want  bool
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
			assert.Equal(t, tt.want, got)
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
	require.NoError(t, err, "Failed to create test user")

	// ID()メソッドのテスト
	t.Run("ID getter", func(t *testing.T) {
		expectedUUID, _ := uuid.Parse(testID)
		id := user.ID()
		assert.Equal(t, expectedUUID, id)
	})

	// Name()メソッドのテスト
	t.Run("Name getter", func(t *testing.T) {
		name := user.Name()
		assert.Equal(t, testName, name)
	})

	// Avatar()メソッドのテスト
	t.Run("Avatar getter", func(t *testing.T) {
		avatar := user.Avatar()
		assert.Equal(t, testAvatar, avatar)
	})

	// Email()メソッドのテスト
	t.Run("Email getter", func(t *testing.T) {
		email := user.Email()
		assert.Equal(t, testEmail, email)
	})
}

package domain

import (
	"fmt"
	"regexp"
)

// UID は外部認証プロバイダーのユーザーIDを表す値オブジェクト
// 英数字、ハイフン、アンダースコアで構成される（最大128文字）
type UID struct {
	value string
}

// UIDのフォーマット: 英数字、ハイフン、アンダースコアのみ、1-128文字
var uidPattern = regexp.MustCompile(`^[a-zA-Z0-9_-]{1,128}$`)

// NewUID は新しいUIDを作成する
func NewUID(value string) (UID, error) {
	if value == "" {
		return UID{}, fmt.Errorf("UIDは空にできません")
	}
	if !uidPattern.MatchString(value) {
		return UID{}, fmt.Errorf("無効なUIDフォーマット: %s", value)
	}
	return UID{value: value}, nil
}

// String はUIDの文字列表現を返す
func (u UID) String() string {
	return u.value
}

// IsEmpty はUIDが空かどうかを返す
func (u UID) IsEmpty() bool {
	return u.value == ""
}

// Equals は2つのUIDが等しいかどうかを返す
func (u UID) Equals(other UID) bool {
	return u.value == other.value
}

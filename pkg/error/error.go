package dattierr

import (
	"fmt"
	"time"
)

// BadEmailError
type BadEmailError struct {
	When time.Time
}

func NewBadEmailError() error {
	return &BadEmailError{
		When: time.Now(),
	}
}

// Error implements error.
func (e *BadEmailError) Error() string {
	return fmt.Sprintf("メールアドレスの形式が正しくありません %s", e.When)
}

// BadNameError
type BadNameError struct {
	When time.Time
}

func NewBadNameError() error {
	return &BadNameError{
		When: time.Now(),
	}
}

// Error implements error.
func (e *BadNameError) Error() string {
	return fmt.Sprintf("ユーザー名の形式が正しくありません %s", e.When)
}

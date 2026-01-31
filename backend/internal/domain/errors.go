package domain

import (
	"fmt"
)

type ValidationError struct {
	field   string
	message string
}

func NewValidationError(field, message string) *ValidationError {
	return &ValidationError{
		field:   field,
		message: message,
	}
}

func (e *ValidationError) Error() string {
	return fmt.Sprintf("%s: %s", e.field, e.message)
}

// NotFoundError リソースが見つからないエラー
type NotFoundError struct {
	resource string
	id       string
}

// NewNotFoundError NotFoundErrorのファクトリ関数
func NewNotFoundError(resource, id string) *NotFoundError {
	return &NotFoundError{
		resource: resource,
		id:       id,
	}
}

func (e *NotFoundError) Error() string {
	return fmt.Sprintf("%s (id=%s) が見つかりません", e.resource, e.id)
}

// Resource 見つからなかったリソース名を返す
func (e *NotFoundError) Resource() string {
	return e.resource
}

// ID 見つからなかったリソースのIDを返す
func (e *NotFoundError) ID() string {
	return e.id
}

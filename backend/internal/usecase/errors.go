package usecase

import "fmt"

// ForbiddenError 認可エラー (操作権限がない場合)
type ForbiddenError struct {
	message string
}

// NewForbiddenError ForbiddenErrorのファクトリ関数
func NewForbiddenError(message string) *ForbiddenError {
	return &ForbiddenError{message: message}
}

func (e *ForbiddenError) Error() string {
	return e.message
}

// ConflictError 競合エラー (リソースが既に存在する場合)
type ConflictError struct {
	resource string
	message  string
}

// NewConflictError ConflictErrorのファクトリ関数
func NewConflictError(resource, message string) *ConflictError {
	return &ConflictError{
		resource: resource,
		message:  message,
	}
}

func (e *ConflictError) Error() string {
	return fmt.Sprintf("%s: %s", e.resource, e.message)
}

// Resource 競合したリソース名を返す
func (e *ConflictError) Resource() string {
	return e.resource
}

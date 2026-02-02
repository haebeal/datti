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

// Is errors.Isで型判定できるようにする
func (e *ValidationError) Is(target error) bool {
	_, ok := target.(*ValidationError)
	return ok
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

// Is errors.Isで型判定できるようにする
func (e *NotFoundError) Is(target error) bool {
	_, ok := target.(*NotFoundError)
	return ok
}

// ForbiddenError 認可エラー(操作権限がない場合)
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

// Is errors.Isで型判定できるようにする
func (e *ForbiddenError) Is(target error) bool {
	_, ok := target.(*ForbiddenError)
	return ok
}

// ConflictError 競合エラー(リソースが既に存在する場合)
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

// Is errors.Isで型判定できるようにする
func (e *ConflictError) Is(target error) bool {
	_, ok := target.(*ConflictError)
	return ok
}

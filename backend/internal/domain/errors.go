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

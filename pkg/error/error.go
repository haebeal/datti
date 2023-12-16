package dattierr

import (
	"fmt"
	"time"
)

// BadRequestError HTTP Status Code: 400
type BadRequestError struct {
	When time.Time
}

func NewMyError() error {
	return &BadRequestError{
		When: time.Now(),
	}
}

// Error implements error.
func (e *BadRequestError) Error() string {
	return fmt.Sprintf("error at %s", e.When)
}

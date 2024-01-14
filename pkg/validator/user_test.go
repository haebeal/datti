package validator_test

import (
	"testing"

	"github.com/datti-api/pkg/validator"
)

func TestValidatorEmail(t *testing.T) {
	email := "vividnasubi@gmail.com"
	if err := validator.ValidatorEmail(email); err != nil {
		t.Fatalf("Faild Email Validator %v", err)
	}

	email = ""
	if err := validator.ValidatorEmail(email); err == nil {
		t.Fatalf("Failed Email Validator %v", err)
	}
}

func TestValidatorName(t *testing.T) {
	name := "tasak"
	if err := validator.ValidatorName(name); err != nil {
		t.Fatalf("Failed Name Validator %v", err)
	}

	name = ""
	if err := validator.ValidatorName(name); err != nil {
		t.Fatalf("Failed Name Validator %v", err)
	}
}

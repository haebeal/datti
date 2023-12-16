package validator

import (
	"unicode/utf8"

	dattierr "github.com/datti-api/pkg/error"
)

func ValidatorEmail(email string) error {
	if utf8.RuneCountInString(email) == 0 {
		err := dattierr.NewMyError()
		return err
	}
	return nil
}

func ValidatorName(name string) error {
	if utf8.RuneCountInString(name) == 0 {
		err := dattierr.NewMyError()
		return err
	}
	return nil
}

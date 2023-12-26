package validator

import (
	"unicode/utf8"

	dattierr "github.com/datti-api/pkg/error"
)

/*
メールアドレスの文字数検査
0文字の場合はエラーを投げる
*/
func ValidatorEmail(email string) error {
	if utf8.RuneCountInString(email) == 0 {
		err := dattierr.NewBadEmailError()
		return err
	}
	return nil
}

/*
ユーザー名の文字数検査
0文字の場合はエラーを投げる
*/
func ValidatorName(name string) error {
	if utf8.RuneCountInString(name) == 0 {
		err := dattierr.NewBadNameError()
		return err
	}
	return nil
}

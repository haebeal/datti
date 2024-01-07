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

// 金融機関番号検査
func ValidatorBankCode(bankCode string) bool {
	return utf8.RuneCountInString(bankCode) == 4
}

// 口座番号の検査
func ValidatorAccountCode(accountCode string) bool {
	return utf8.RuneCountInString(accountCode) >= 4 && utf8.RuneCountInString(accountCode) <= 7
}

// 支店番号の検査
func ValidatorBranchCode(branchCode string) bool {
	return utf8.RuneCountInString(branchCode) == 3
}

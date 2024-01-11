package validator

import (
	validation "github.com/go-ozzo/ozzo-validation"
	"github.com/go-ozzo/ozzo-validation/is"
)

// メールアドレスの検査
func ValidatorEmail(email string) error {
	return validation.Validate(email,
		validation.Required.Error("メールアドレスは必須項目です"),
		validation.Length(1, 255).Error("メールアドレスは1~255文字で登録してください"),
		is.Email.Error("メールアドレスを入力してください"),
	)
}

// 画像URLの検査
func ValidatorPhotoUrl(photoUrl string) error {
	return validation.Validate(photoUrl,
		is.URL.Error("正しいURLを登録してください"),
	)
}

// ユーザー名の検査
func ValidatorName(name string) error {
	return validation.Validate(name,
		validation.Required.Error("ユーザー名は必須項目です"),
		validation.Length(1, 255).Error("ユーザー名は1~255文字で登録してください"),
	)
}

// 金融機関番号の検査
func ValidatorBankCode(bankCode string) error {
	return validation.Validate(bankCode,
		validation.Required.Error("金融機関コードは必須項目です"),
		validation.Length(4, 4).Error("金融機関コードは4桁で登録してください"),
	)
}

// 口座番号の検査
func ValidatorAccountCode(accountCode string) error {
	return validation.Validate(accountCode,
		validation.Required.Error("口座番号は必須項目です"),
		validation.Length(4, 7).Error("口座番号は4~7桁で登録してください"),
	)
}

// 支店番号の検査
func ValidatorBranchCode(branchCode string) error {
	return validation.Validate(branchCode,
		validation.Required.Error("支店番号は必須項目です"),
		validation.Length(3, 3).Error("支店番号は3桁で登録してください"),
	)
}

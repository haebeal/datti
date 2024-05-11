package response

import "github.com/datti-api/pkg/domain/model"

type UserWithBankAccount struct {
	UID      string `json:"uid"`
	Name     string `json:"name"`
	Email    string `json:"email"`
	PhotoUrl string `json:"photoUrl"`
	Bank     struct {
		AccountCode string `json:"accountCode"`
		BankCode    string `json:"bankCode"`
		BranchCode  string `json:"branchCode"`
	} `json:"bank"`
}

type User struct {
	UID      string `json:"uid"`
	Name     string `json:"name"`
	Email    string `json:"email"`
	PhotoUrl string `json:"photoUrl"`
}

type Users struct {
	Users []*model.User `json:"usrs"`
}

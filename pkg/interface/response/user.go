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
	Status string `json:"status"`
}

type User struct {
	UID      string `json:"uid"`
	Name     string `json:"name"`
	Email    string `json:"email"`
	PhotoUrl string `json:"photoUrl"`
}

type UserStatus struct {
	UID    string `json:"uid"`
	Name   string `json:"name"`
	Status string `json:"status"`
}

type Users struct {
	Users []*model.User `json:"users"`
}

package request

type UserGetRequest struct {
	Email string `json:"email"`
}

type UpdateUserRequest struct {
	Name        string `json:"name"`
	Url         string `json:"photoUrl"`
	BankCode    string `json:"bankCode"`
	BranchCode  string `json:"branchCode"`
	AccountCode string `json:"accountCode"`
}

type GetUserByEmailRequest struct {
	Email string `json:"email"`
}

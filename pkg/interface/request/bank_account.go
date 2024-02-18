package request

type BankAccountPostRequest struct {
	BankCode    string `json:"bankCode"`
	BranchCode  string `json:"branchCode"`
	AccountCode string `json:"accountCode"`
}

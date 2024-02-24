package response

import "time"

type BankAccountResponse struct {
	UID         string     `json:"uid"`
	AccountCode string     `json:"accountCode"`
	BankCode    string     `json:"bankCode"`
	BranchCode  string     `json:"branchCode"`
	CreatedAt   time.Time  `json:"createdAt"`
	UpdatreAt   time.Time  `json:"updatedAt"`
	DeletedAt   *time.Time `json:"deletedAt"`
}

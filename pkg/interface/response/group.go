package response

import "github.com/datti-api/pkg/domain/model"

type Groups struct {
	Groups []*model.Group `json:"groups"`
}

type Members struct {
	Members []struct {
		UID      string `json:"uid"`
		Name     string `json:"name"`
		Email    string `json:"email"`
		PhotoUrl string `json:"photoUrl"`
		Status   string `json:"status"`
	}
}

package response

import "github.com/datti-api/pkg/domain/model"

type Groups struct {
	Groups []*model.Group `json:"groups"`
}

type Members struct {
	Members []*model.User `json:"members"`
}

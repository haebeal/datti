package response

import (
	"github.com/datti-api/pkg/domain/model"
)

type User struct {
	UID      string `json:"userId"`
	Name     string `json:"name"`
	Email    string `json:"email"`
	PhotoUrl string `json:"photoUrl"`
	Status   string `json:"status"`
}

type Users struct {
	Users []*model.User `json:"users"`
}

package response

import (
	"github.com/datti-api/pkg/domain/model"
	"github.com/google/uuid"
)

type User struct {
	UID      uuid.UUID `json:"userId"`
	Name     string    `json:"name"`
	Email    string    `json:"email"`
	PhotoUrl string    `json:"photoUrl"`
	Status   string    `json:"status"`
}

type Users struct {
	Users []*model.User `json:"users"`
}

type Cursor struct {
	StartCursor uuid.UUID `json:"startCursor"`
	EndCursor   uuid.UUID `json:"endCursor"`
}

package response

import "github.com/google/uuid"

type Group struct {
	ID   uuid.UUID `json:"groupId"`
	Name string    `json:"name"`
}

type Groups struct {
	Groups []struct {
		ID   uuid.UUID `json:"groupId"`
		Name string    `json:"name"`
	} `json:"groups"`
	StartCursor uuid.UUID `json:"startCursor"`
	EndCursor   uuid.UUID `json:"endCursor"`
}

type GroupMembers struct {
	ID      uuid.UUID `json:"groupId"`
	Name    string    `json:"name"`
	Members []struct {
		UID      uuid.UUID `json:"userId"`
		Name     string    `json:"name"`
		Email    string    `json:"email"`
		PhotoUrl string    `json:"photoUrl"`
		Status   string    `json:"status"`
	} `json:"members"`
}

type Members struct {
	Members []struct {
		UID      uuid.UUID `json:"userId"`
		Name     string    `json:"name"`
		Email    string    `json:"email"`
		PhotoUrl string    `json:"photoUrl"`
		Status   string    `json:"status"`
	} `json:"members"`
}

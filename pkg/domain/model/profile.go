package model

type Profile struct {
	ID       string `json:"uid"`
	Name     string `json:"name"`
	PhotoUrl string `json:"photoUrl"`
}

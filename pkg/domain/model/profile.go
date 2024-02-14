package model

type Profile struct {
	ID       string `json:"userId"`
	Name     string `json:"name"`
	PhotoUrl string `json:"photoUrl"`
}

package model

type User struct {
	ID       string `json:"userId"`
	Name     string `json:"name"`
	Email    string `json:"email"`
	PhotoUrl string `json:"photoUrl"`
}

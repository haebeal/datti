package model

type UserStatus struct {
	ID       string `bun:"user_id"`
	Name     string `bun:"user_name"`
	Email    string `bun:"user_email"`
	PhotoUrl string `bun:"user_photo_url"`
	Status   string `bun:"status"`
}

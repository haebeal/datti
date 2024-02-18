package request

type ProfileUpdateRequest struct {
	Name string `json:"name"`
	Url  string `json:"photoUrl"`
}

type ProfileGetByEmailRequest struct {
	Email string `json:"email"`
}

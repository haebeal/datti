package request

type UpdateProfileRequest struct {
	Name string `json:"name"`
	Url  string `json:"photoUrl"`
}

type GetByEmailRequest struct {
	Email string `json:"email"`
}

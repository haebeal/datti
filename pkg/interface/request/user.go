package request

type UserGetRequest struct {
	Email string `json:"email"`
}

type UpdateUserRequest struct {
	Name string `json:"name"`
	Url  string `json:"photoUrl"`
}

type GetUserByEmailRequest struct {
	Email string `json:"email"`
}

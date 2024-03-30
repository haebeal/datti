package response

type User struct {
	UID      string `json:"uid"`
	Name     string `json:"name"`
	Email    string `json:"email"`
	PhotoUrl string `json:"photoUrl"`
}

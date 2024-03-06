package response

type User struct {
	UID      string `json:"uid"`
	Name     string `json:"name"`
	PhotoUrl string `json:"photoUrl"`
}

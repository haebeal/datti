package request

type ProfileRequest struct {
	Name string `json:"name"`
	Url  string `json:"photoUrl"`
}

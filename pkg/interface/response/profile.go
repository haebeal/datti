package response

type Profile struct {
	UID      string `json:"uid"`
	Name     string `json:"name"`
	PhotoUrl string `json:"photoUrl"`
}

package response

type Payments struct {
	Payments []struct {
		User struct {
			ID       string `json:"uid"`
			Name     string `json:"name"`
			Email    string `json:"email"`
			PhotoUrl string `json:"photoUrl"`
		} `json:"user"`
		Balance int `json:"amount"`
	} `json:"payments"`
}

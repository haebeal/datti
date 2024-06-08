package response

type Groups struct {
	Groups []struct {
		ID   string `json:"id"`
		Name string `json:"name"`
	} `json:"groups"`
}

type Members struct {
	Members []struct {
		UID      string `json:"uid"`
		Name     string `json:"name"`
		Email    string `json:"email"`
		PhotoUrl string `json:"photoUrl"`
		Status   string `json:"status"`
	}
}

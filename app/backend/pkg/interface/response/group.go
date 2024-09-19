package response

type Group struct {
	ID   string `json:"groupId"`
	Name string `json:"name"`
}

type Groups struct {
	Groups []struct {
		ID   string `json:"groupId"`
		Name string `json:"name"`
	} `json:"groups"`
}

type GroupMembers struct {
	ID      string `json:"groupId"`
	Name    string `json:"name"`
	Members []struct {
		UID      string `json:"userId"`
		Name     string `json:"name"`
		Email    string `json:"email"`
		PhotoUrl string `json:"photoUrl"`
		Status   string `json:"status"`
	} `json:"members"`
}

type Members struct {
	Members []struct {
		UID      string `json:"userId"`
		Name     string `json:"name"`
		Email    string `json:"email"`
		PhotoUrl string `json:"photoUrl"`
		Status   string `json:"status"`
	} `json:"members"`
}

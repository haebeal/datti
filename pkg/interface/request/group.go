package request

type GroupCreate struct {
	Name string   `json:"name"`
	Uids []string `json:"uids"`
}

type Uids struct {
	Uids []string `json:"uids"`
}

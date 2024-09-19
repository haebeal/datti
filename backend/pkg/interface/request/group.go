package request

type GroupCreate struct {
	Name string   `json:"name"`
	Uids []string `json:"userIds"`
}

type Uids struct {
	Uids []string `json:"userIds"`
}

type GroupUpdate struct {
	Name string `json:"name"`
}

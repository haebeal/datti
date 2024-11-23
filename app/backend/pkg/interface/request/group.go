package request

import "github.com/google/uuid"

type GroupCreate struct {
	Name string     `json:"name"`
	Uids uuid.UUIDs `json:"userIds"`
}

type Uids struct {
	Uids uuid.UUIDs `json:"userIds"`
}

type GroupUpdate struct {
	Name string `json:"name"`
}

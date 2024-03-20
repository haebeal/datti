package model

type Group struct {
	ID   string `bun:"id,pk" json:"id"`
	Name string `bun:"name" json:"name"`
}

package model

type Group struct {
	ID   string `bun:"id,pk"`
	Name string `bun:"name"`
}

package model

type Group struct {
	ID   string `json:"id"`
	Name string `gorm:"not null"`
}

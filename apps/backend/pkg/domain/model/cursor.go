package model

import "github.com/google/uuid"

type Cursor struct {
	Start uuid.UUID
	End   uuid.UUID
}

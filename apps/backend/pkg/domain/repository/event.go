package repository

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/haebeal/datti/pkg/domain/model"
)

type EventRepository interface {
	CreateEvent(c context.Context, event *model.Event) (*model.Event, error)
	UpdateEvent(c context.Context, id uuid.UUID, uid uuid.UUID, gid uuid.UUID, name string, eventOn time.Time) (*model.Event, error)
	DeleteEvent(c context.Context, eventID uuid.UUID) error
	GetEvent(c context.Context, id uuid.UUID) (*model.Event, error)
	GetEvents(c context.Context, gid uuid.UUID) ([]*model.Event, error)
}

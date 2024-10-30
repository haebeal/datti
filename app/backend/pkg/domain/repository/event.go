package repository

import (
	"context"
	"time"

	"github.com/datti-api/pkg/domain/model"
	"github.com/google/uuid"
)

type EventRepository interface {
	CreateEvent(c context.Context, event *model.Event) (*model.Event, error)
	UpdateEvent(c context.Context, id uuid.UUID, uid uuid.UUID, gid uuid.UUID, name string, eventAt time.Time) (*model.Event, error)
	DeleteEvent(c context.Context, eventID uuid.UUID) error
	GetEvent(c context.Context, id uuid.UUID) (*model.Event, error)
	GetEvents(c context.Context, gid uuid.UUID) ([]*model.Event, error)
}

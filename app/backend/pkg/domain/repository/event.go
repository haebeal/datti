package repository

import (
	"context"
	"time"

	"github.com/datti-api/pkg/domain/model"
)

type EventRepository interface {
	CreateEvent(c context.Context, event *model.Event) (*model.Event, error)
	UpdateEvent(c context.Context, id string, uid string, gid string, name string, eventAt time.Time) (*model.Event, error)
	DeleteEvent(c context.Context, eventID string) error
	GetEvent(c context.Context, id string) (*model.Event, error)
	GetEvents(c context.Context, gid string) ([]*model.Event, error)
}

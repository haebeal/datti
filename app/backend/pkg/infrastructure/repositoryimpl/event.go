package repositoryimpl

import (
	"context"
	"time"

	"github.com/datti-api/pkg/domain/model"
	"github.com/datti-api/pkg/domain/repository"
	"github.com/datti-api/pkg/infrastructure/database"
	"github.com/google/uuid"
)

type eventRepositoryImpl struct {
	DBEngine database.DBClient
}

// CreateEvent implements repository.EventRepository.
func (e *eventRepositoryImpl) CreateEvent(c context.Context, event *model.Event) (*model.Event, error) {
	_, err := e.DBEngine.Client.NewInsert().
		Model(event).
		Exec(c)
	if err != nil {
		return nil, err
	}

	return event, nil
}

// GetEvent implements repository.EventRepository.
func (e *eventRepositoryImpl) GetEvent(c context.Context, id uuid.UUID) (*model.Event, error) {
	event := new(model.Event)
	err := e.DBEngine.Client.NewSelect().
		Table("events").
		Where("id = ?", id).
		Scan(c, event)
	if err != nil {
		return nil, err
	}

	return event, nil
}

// GetEvents implements repository.EventRepository.
func (e *eventRepositoryImpl) GetEvents(c context.Context, gid uuid.UUID) ([]*model.Event, error) {
	events := new([]*model.Event)
	err := e.DBEngine.Client.NewSelect().
		Table("events").
		Where("group_id = ?", gid).
		Order("event_on DESC").
		Scan(c, events)
	if err != nil {
		return nil, err
	}

	return *events, nil
}

// UpdateEvent implements repository.EventRepository.
func (e *eventRepositoryImpl) UpdateEvent(c context.Context, id uuid.UUID, uid uuid.UUID, gid uuid.UUID, name string, eventAt time.Time) (*model.Event, error) {
	event := new(model.Event)
	event.ID = id
	event.Name = name
	event.EventOn = eventAt
	event.GroupId = gid
	event.CreatedBy = uid

	//レコードの更新
	_, err := e.DBEngine.Client.NewUpdate().
		Model(event).
		Column("name", "event_on").
		Where("id = ?", id).
		Exec(c)
	if err != nil {
		return nil, err
	}

	// 更新したレコードを取得
	err = e.DBEngine.Client.NewSelect().
		Table("events").
		Where("id = ?", id).
		Scan(c, event)
	if err != nil {
		return nil, err
	}

	return event, nil
}

func (e *eventRepositoryImpl) DeleteEvent(c context.Context, eventID uuid.UUID) error {
	_, err := e.DBEngine.Client.NewDelete().
		Table("events").
		Where("id = ?", eventID).
		Exec(c)
	if err != nil {
		return err
	}

	return nil
}

func NewEventRepository(engine *database.DBClient) repository.EventRepository {
	return &eventRepositoryImpl{
		DBEngine: *engine,
	}
}

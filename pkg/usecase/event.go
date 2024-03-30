package usecase

import (
	"context"
	"time"

	"github.com/datti-api/pkg/domain/model"
	"github.com/datti-api/pkg/domain/repository"
)

type EventUseCase interface {
	CreateEvent(c context.Context, uid string, gid string, name string, eventAt time.Time) (*model.Event, error)
	UpdateEvent(c context.Context, id string, name string, eventAt time.Time) (*model.Event, error)
	GetEvent(c context.Context, id string) (*model.Event, error)
	GetEvents(c context.Context, gid string) ([]*model.Event, error)
}

type eventUseCase struct {
	eventRepository repository.EventRepository
	groupRepository repository.GroupRepository
	userRepository  repository.UserRepository
	transaction     repository.Transaction
}

// CreateEvent implements EventUseCase.
func (e *eventUseCase) CreateEvent(c context.Context, uid string, gid string, name string, eventAt time.Time) (*model.Event, error) {
	v, err := e.transaction.DoInTx(c, func(ctx context.Context) (interface{}, error) {
		event, err := e.eventRepository.CreateEvent(c, uid, gid, name, eventAt)
		if err != nil {
			return nil, err
		}

		return event, nil
	})
	if err != nil {
		return nil, err
	}

	event := v.(*model.Event)
	return event, nil
}

// GetEvent implements EventUseCase.
func (e *eventUseCase) GetEvent(c context.Context, id string) (*model.Event, error) {
	event, err := e.eventRepository.GetEvent(c, id)
	if err != nil {
		return nil, err
	}

	return event, nil
}

// GetEvents implements EventUseCase.
func (e *eventUseCase) GetEvents(c context.Context, gid string) ([]*model.Event, error) {
	events, err := e.eventRepository.GetEvents(c, gid)
	if err != nil {
		return nil, err
	}

	return events, nil
}

// UpdateEvent implements EventUseCase.
func (e *eventUseCase) UpdateEvent(c context.Context, id string, name string, eventAt time.Time) (*model.Event, error) {
	v, err := e.transaction.DoInTx(c, func(ctx context.Context) (interface{}, error) {
		event, err := e.eventRepository.UpdateEvent(c, id, name, eventAt)
		if err != nil {
			return nil, err
		}
		return event, nil
	})
	if err != nil {
		return nil, err
	}

	event := v.(*model.Event)
	return event, nil
}

func NewEventUseCase(eventRepo repository.EventRepository, groupRepo repository.GroupRepository, userRepo repository.UserRepository, tx repository.Transaction) EventUseCase {
	return &eventUseCase{
		eventRepository: eventRepo,
		groupRepository: groupRepo,
		userRepository:  userRepo,
		transaction:     tx,
	}
}

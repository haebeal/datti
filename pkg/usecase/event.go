package usecase

import (
	"context"
	"time"

	"github.com/datti-api/pkg/domain/model"
	"github.com/datti-api/pkg/domain/repository"
)

type EventUseCase interface {
	CreateEvent(c context.Context, uid string, gid string, name string, eventAt time.Time) (*model.Event, *model.User, error)
	UpdateEvent(c context.Context, id string, uid string, gid string, name string, eventAt time.Time) (*model.Event, *model.User, error)
	GetEvent(c context.Context, id string) (*model.Event, *model.User, error)
	GetEvents(c context.Context, gid string) ([]*model.Event, error)
}

type eventUseCase struct {
	eventRepository repository.EventRepository
	userRepository  repository.UserRepository
	groupRepository repository.GroupRepository
	transaction     repository.Transaction
}

// CreateEvent implements EventUseCase.
func (e *eventUseCase) CreateEvent(c context.Context, uid string, gid string, name string, eventAt time.Time) (*model.Event, *model.User, error) {
	v, err := e.transaction.DoInTx(c, func(ctx context.Context) (interface{}, error) {
		event, err := e.eventRepository.CreateEvent(c, uid, gid, name, eventAt)
		if err != nil {
			return nil, err
		}

		return event, nil
	})
	if err != nil {
		return nil, nil, err
	}
	event := v.(*model.Event)

	user, err := e.userRepository.GetUserByUid(c, event.CreatedBy)
	if err != nil {
		return nil, nil, err
	}

	return event, user, nil
}

// GetEvent implements EventUseCase.
func (e *eventUseCase) GetEvent(c context.Context, id string) (*model.Event, *model.User, error) {
	event, err := e.eventRepository.GetEvent(c, id)
	if err != nil {
		return nil, nil, err
	}
	user, err := e.userRepository.GetUserByUid(c, event.CreatedBy)
	if err != nil {
		return nil, nil, err
	}

	return event, user, nil
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
func (e *eventUseCase) UpdateEvent(c context.Context, id string, uid string, gid string, name string, eventAt time.Time) (*model.Event, *model.User, error) {
	v, err := e.transaction.DoInTx(c, func(ctx context.Context) (interface{}, error) {
		event, err := e.eventRepository.UpdateEvent(c, id, uid, gid, name, eventAt)
		if err != nil {
			return nil, err
		}
		return event, nil
	})
	if err != nil {
		return nil, nil, err
	}

	event := v.(*model.Event)
	user, err := e.userRepository.GetUserByUid(c, event.CreatedBy)
	if err != nil {
		return nil, nil, err
	}

	return event, user, nil
}

func NewEventUseCase(eventRepo repository.EventRepository, userRepo repository.UserRepository, groupRepo repository.GroupRepository, tx repository.Transaction) EventUseCase {
	return &eventUseCase{
		eventRepository: eventRepo,
		userRepository:  userRepo,
		groupRepository: groupRepo,
		transaction:     tx,
	}
}

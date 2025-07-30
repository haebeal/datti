package application

import (
	"time"

	"github.com/haebeal/datti/pkg/core"
	"github.com/haebeal/datti/pkg/repository"
)

type EventUseCase struct {
	er repository.IEventRepository
}

func NewEventUseCase(er repository.IEventRepository) *EventUseCase {
	return &EventUseCase{
		er: er,
	}
}

func (eu *EventUseCase) Create(
	name string,
	eventDate time.Time,
) (*core.Event, error) {
	event, err := core.CreateEvent(name, eventDate)
	if err != nil {
		return nil, err
	}

	err = eu.er.Create(event)
	if err != nil {
		return nil, err
	}

	return event, nil
}

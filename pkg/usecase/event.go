package usecase

import (
	"context"

	"github.com/datti-api/pkg/domain/model"
	"github.com/datti-api/pkg/domain/repository"
	"github.com/datti-api/pkg/usecase/dto"
)

type EventUseCase interface {
	CreateEvent(c context.Context, uid string, gid string, eventRequest *dto.EventCreate) (*dto.EventCreateResponse, error)
	UpdateEvent(c context.Context, id string, uid string, gid string, eventRequest *model.EventCreate) (*model.Event, *model.User, error)
	GetEvent(c context.Context, id string) (*model.Event, *model.User, error)
	GetEvents(c context.Context, gid string) ([]*model.Event, error)
}

type eventUseCase struct {
	eventRepository   repository.EventRepository
	userRepository    repository.UserRepository
	groupRepository   repository.GroupRepository
	paymentRepository repository.PaymentRepository
	transaction       repository.Transaction
}

// CreateEvent implements EventUseCase.
func (e *eventUseCase) CreateEvent(c context.Context, uid string, gid string, eventRequest *dto.EventCreate) (*dto.EventCreateResponse, error) {
	eventCreate := &model.Event{
		Name:      eventRequest.Name,
		CreatedBy: eventRequest.CreatedBy,
		Amount:    eventRequest.Amount,
		GroupId:   eventRequest.GroupId,
		EventedAt: eventRequest.EventedAt,
	}

	v, err := e.transaction.DoInTx(c, func(ctx context.Context) (interface{}, error) {
		event, err := e.eventRepository.CreateEvent(c, eventCreate)
		if err != nil {
			return nil, err
		}

		return event, nil
	})
	if err != nil {
		return nil, err
	}
	event := v.(*model.Event)
	eventCrateResponse := &dto.EventCreateResponse{
		ID:        event.ID,
		Name:      event.Name,
		EventedAt: event.EventedAt,
		CreatedBy: event.CreatedBy,
		Amount:    event.Amount,
		GroupId:   event.GroupId,
	}

	// 支払いを登録
	for _, payment := range eventRequest.Payments {
		p, err := e.paymentRepository.CreatePayment(c, event.ID, eventRequest.PaidBy, payment.User, eventRequest.EventedAt, payment.Amount)
		if err != nil {
			return nil, err
		}
		u, err := e.userRepository.GetUserByUid(c, p.PaidTo)
		if err != nil {
			return nil, err
		}

		eventCrateResponse.Paymetns = append(eventCrateResponse.Paymetns, dto.Payment{
			ID:     p.ID,
			Name:   u.Name,
			Amount: p.Amount,
		})
	}

	return eventCrateResponse, nil
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
func (e *eventUseCase) UpdateEvent(c context.Context, id string, uid string, gid string, eventRequest *model.EventCreate) (*model.Event, *model.User, error) {
	v, err := e.transaction.DoInTx(c, func(ctx context.Context) (interface{}, error) {
		event, err := e.eventRepository.UpdateEvent(c, id, uid, gid, eventRequest.Name, eventRequest.EventedAt)
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

	// // 支払いを登録
	// for _, payment := range eventRequest.Payments {

	// }

	return event, user, nil
}

func NewEventUseCase(eventRepo repository.EventRepository, userRepo repository.UserRepository, groupRepo repository.GroupRepository, paymentRepo repository.PaymentRepository, tx repository.Transaction) EventUseCase {
	return &eventUseCase{
		eventRepository:   eventRepo,
		userRepository:    userRepo,
		groupRepository:   groupRepo,
		paymentRepository: paymentRepo,
		transaction:       tx,
	}
}

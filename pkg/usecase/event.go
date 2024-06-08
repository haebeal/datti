package usecase

import (
	"context"
	"time"

	"github.com/datti-api/pkg/domain/model"
	"github.com/datti-api/pkg/domain/repository"
	"github.com/datti-api/pkg/usecase/dto"
)

type EventUseCase interface {
	CreateEvent(c context.Context, uid string, gid string, eventRequest *dto.EventCreate) (*dto.EventResponse, error)
	UpdateEvent(c context.Context, id string, uid string, gid string, eventRequest *dto.EventUpdate) (*dto.EventResponse, error)
	GetEvent(c context.Context, id string) (*dto.EventResponse, error)
	GetEvents(c context.Context, gid string) (*dto.Events, error)
}

type eventUseCase struct {
	eventRepository   repository.EventRepository
	userRepository    repository.UserRepository
	groupRepository   repository.GroupRepository
	paymentRepository repository.PaymentRepository
	transaction       repository.Transaction
}

// CreateEvent implements EventUseCase.
func (e *eventUseCase) CreateEvent(c context.Context, uid string, gid string, eventCreated *dto.EventCreate) (*dto.EventResponse, error) {
	eventCreate := &model.Event{
		Name:      eventCreated.Name,
		CreatedBy: eventCreated.CreatedBy,
		PaidBy:    eventCreated.PaidBy,
		Amount:    eventCreated.Amount,
		GroupId:   eventCreated.GroupId,
		EventedAt: eventCreated.EventedAt,
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
	eventCrateResponse := &dto.EventResponse{
		ID:        event.ID,
		Name:      event.Name,
		EventedAt: event.EventedAt,
		CreatedBy: event.CreatedBy,
		PaidBy:    event.PaidBy,
		Amount:    event.Amount,
		GroupId:   event.GroupId,
	}

	// 支払いを登録
	for i, p := range eventCreated.Payments {
		payment, err := e.paymentRepository.CreatePayment(c, event.ID, eventCreated.Payments[i].PaidTo, eventCreated.PaidBy, eventCreated.EventedAt, p.Amount)
		if err != nil {
			return nil, err
		}
		user, err := e.userRepository.GetUserByUid(c, payment.PaidTo)
		if err != nil {
			return nil, err
		}

		eventCrateResponse.Paymetns = append(eventCrateResponse.Paymetns, struct {
			ID     string
			PaidTo string
			Amount int
		}{
			ID:     payment.ID,
			PaidTo: user.ID,
			Amount: payment.Amount,
		})
	}

	return eventCrateResponse, nil
}

// GetEvent implements EventUseCase.
func (e *eventUseCase) GetEvent(c context.Context, id string) (*dto.EventResponse, error) {
	event, err := e.eventRepository.GetEvent(c, id)
	if err != nil {
		return nil, err
	}

	eventResponse := &dto.EventResponse{
		ID:        event.ID,
		Name:      event.Name,
		EventedAt: event.EventedAt,
		CreatedBy: event.CreatedBy,
		PaidBy:    event.PaidBy,
		Amount:    event.Amount,
		GroupId:   event.GroupId,
	}

	payments, err := e.paymentRepository.GetPaymentByEventId(c, event.ID)
	if err != nil {
		return nil, err
	}

	for _, p := range payments {
		user, err := e.userRepository.GetUserByUid(c, p.PaidTo)
		if err != nil {
			return nil, err
		}

		eventResponse.Paymetns = append(eventResponse.Paymetns, struct {
			ID     string
			PaidTo string
			Amount int
		}{
			ID:     p.ID,
			PaidTo: user.ID,
			Amount: p.Amount,
		})
	}

	return eventResponse, nil
}

// GetEvents implements EventUseCase.
func (e *eventUseCase) GetEvents(c context.Context, gid string) (*dto.Events, error) {
	events, err := e.eventRepository.GetEvents(c, gid)
	if err != nil {
		return nil, err
	}

	eventList := &dto.Events{}

	for _, event := range events {
		user, err := e.userRepository.GetUserByUid(c, event.PaidBy)
		if err != nil {
			return nil, err
		}

		eventList.Events = append(eventList.Events, struct {
			ID        string
			Name      string
			EventedAt time.Time
			PaidBy    struct {
				ID   string
				Name string
			}
			Amount int
		}{
			ID:        event.ID,
			Name:      event.Name,
			EventedAt: event.EventedAt,
			PaidBy: struct {
				ID   string
				Name string
			}{
				ID:   user.ID,
				Name: user.Name,
			},
			Amount: event.Amount,
		})
	}

	return eventList, err
}

// UpdateEvent implements EventUseCase.
func (e *eventUseCase) UpdateEvent(c context.Context, id string, uid string, gid string, eventUpdate *dto.EventUpdate) (*dto.EventResponse, error) {
	// イベントテーブルのレコードを更新
	v, err := e.transaction.DoInTx(c, func(ctx context.Context) (interface{}, error) {
		event, err := e.eventRepository.UpdateEvent(c, id, uid, gid, eventUpdate.Name, eventUpdate.EventedAt)
		if err != nil {
			return nil, err
		}
		return event, nil
	})
	if err != nil {
		return nil, err
	}

	event := v.(*model.Event)
	eventUpdateResponse := &dto.EventResponse{
		ID:        event.ID,
		Name:      event.Name,
		EventedAt: event.EventedAt,
		PaidBy:    event.PaidBy,
		Amount:    event.Amount,
		GroupId:   event.GroupId,
	}

	//支払いテーブルのレコードを更新
	for _, p := range eventUpdate.Payments {
		payment, err := e.paymentRepository.UpdatePayment(c, event.ID, p.PaymentID, event.PaidBy, p.PaidTo, event.EventedAt, p.Amount)
		if err != nil {
			return nil, err
		}
		user, err := e.userRepository.GetUserByUid(c, payment.PaidTo)
		if err != nil {
			return nil, err
		}
		eventUpdateResponse.Paymetns = append(eventUpdateResponse.Paymetns, struct {
			ID     string
			PaidTo string
			Amount int
		}{
			ID:     payment.ID,
			PaidTo: user.ID,
			Amount: payment.Amount,
		})
	}

	return eventUpdateResponse, nil
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

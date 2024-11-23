package usecase

import (
	"context"
	"fmt"
	"time"

	"github.com/datti-api/pkg/domain/model"
	"github.com/datti-api/pkg/domain/repository"
	"github.com/datti-api/pkg/usecase/dto"
	"github.com/google/uuid"
)

type EventUseCase interface {
	CreateEvent(c context.Context, uid uuid.UUID, gid uuid.UUID, eventRequest *dto.EventCreate) (*dto.EventResponse, error)
	UpdateEvent(c context.Context, id uuid.UUID, uid uuid.UUID, gid uuid.UUID, eventRequest *dto.EventUpdate) (*dto.EventResponse, error)
	GetEvent(c context.Context, id uuid.UUID) (*dto.EventResponse, error)
	GetEvents(c context.Context, gid uuid.UUID) (*dto.Events, error)
	DeleteEvent(c context.Context, groupID uuid.UUID, eventID uuid.UUID, userID uuid.UUID) error
}

type eventUseCase struct {
	eventRepository     repository.EventRepository
	userRepository      repository.UserRepository
	groupRepository     repository.GroupRepository
	groupUserRepository repository.GroupUserReopsitory
	paymentRepository   repository.PaymentRepository
	transaction         repository.Transaction
}

// CreateEvent implements EventUseCase.
func (e *eventUseCase) CreateEvent(c context.Context, uid uuid.UUID, gid uuid.UUID, eventCreated *dto.EventCreate) (*dto.EventResponse, error) {
	eventCreate := &model.Event{
		Name:      eventCreated.Name,
		CreatedBy: eventCreated.CreatedBy,
		PaidBy:    eventCreated.PaidBy,
		Amount:    eventCreated.Amount,
		GroupId:   eventCreated.GroupId,
		EventOn:   eventCreated.EventOn,
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
		EventOn:   event.EventOn,
		CreatedBy: event.CreatedBy,
		PaidBy:    event.PaidBy,
		Amount:    event.Amount,
		GroupId:   event.GroupId,
	}

	// 支払いを登録
	for i, p := range eventCreated.Payments {
		payment, err := e.paymentRepository.CreatePaymentWihtEventId(c, event.ID, eventCreated.Payments[i].PaidTo, eventCreated.PaidBy, eventCreated.EventOn, p.Amount)
		if err != nil {
			return nil, err
		}
		user, err := e.userRepository.GetUserByUid(c, payment.PaidTo)
		if err != nil {
			return nil, err
		}

		eventCrateResponse.Paymetns = append(eventCrateResponse.Paymetns, struct {
			PaymentId uuid.UUID
			PaidTo    uuid.UUID
			Amount    int
		}{
			PaymentId: payment.ID,
			PaidTo:    user.ID,
			Amount:    payment.Amount,
		})
	}

	return eventCrateResponse, nil
}

// GetEvent implements EventUseCase.
func (e *eventUseCase) GetEvent(c context.Context, id uuid.UUID) (*dto.EventResponse, error) {
	event, err := e.eventRepository.GetEvent(c, id)
	if err != nil {
		return nil, err
	}

	eventResponse := &dto.EventResponse{
		ID:        event.ID,
		Name:      event.Name,
		EventOn:   event.EventOn,
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
			PaymentId uuid.UUID
			PaidTo    uuid.UUID
			Amount    int
		}{
			PaymentId: p.ID,
			PaidTo:    user.ID,
			Amount:    p.Amount,
		})
	}

	return eventResponse, nil
}

// GetEvents implements EventUseCase.
func (e *eventUseCase) GetEvents(c context.Context, gid uuid.UUID) (*dto.Events, error) {
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
			ID      uuid.UUID
			Name    string
			EventOn time.Time
			PaidBy  struct {
				ID   uuid.UUID
				Name string
			}
			Amount int
		}{
			ID:      event.ID,
			Name:    event.Name,
			EventOn: event.EventOn,
			PaidBy: struct {
				ID   uuid.UUID
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
func (e *eventUseCase) UpdateEvent(c context.Context, id uuid.UUID, uid uuid.UUID, gid uuid.UUID, eventUpdate *dto.EventUpdate) (*dto.EventResponse, error) {
	// イベントテーブルのレコードを更新
	v, err := e.transaction.DoInTx(c, func(ctx context.Context) (interface{}, error) {
		event, err := e.eventRepository.UpdateEvent(c, id, uid, gid, eventUpdate.Name, eventUpdate.EventOn)
		if err != nil {
			return nil, err
		}

		eventUpdateResponse := &dto.EventResponse{
			ID:        event.ID,
			Name:      event.Name,
			EventOn:   event.EventOn,
			CreatedBy: event.CreatedBy,
			PaidBy:    event.PaidBy,
			Amount:    event.Amount,
			GroupId:   event.GroupId,
		}

		userIDMap := make(map[string]bool)

		//支払いテーブルのレコードを更新
		for _, p := range eventUpdate.Payments {
			// ユーザーの重複を検証
			if userIDMap[p.PaidTo.String()] {
				return nil, fmt.Errorf("err: %s", "ユーザーの重複エラー")
			}

			userIDMap[p.PaidTo.String()] = true

			payment := &model.Payment{}

			// グループとユーザーの検証
			_, err = e.groupUserRepository.GetGroupUser(c, event.GroupId, p.PaidTo)
			if err != nil {
				return nil, err
			}

			// 新しく登録されユーザーか判定
			if p.PaymentID.String() == "" {
				// 支払い情報を新規で登録
				payment, err = e.paymentRepository.CreatePaymentWihtEventId(c, event.ID, p.PaidTo, event.PaidBy, event.EventOn, p.Amount)
				if err != nil {
					return nil, err
				}
			} else {
				// 支払い情報を更新
				payment, err = e.paymentRepository.UpdatePayment(c, p.PaymentID, p.PaidTo, event.PaidBy, event.EventOn, p.Amount)
				if err != nil {
					return nil, err
				}
			}

			user, err := e.userRepository.GetUserByUid(c, payment.PaidTo)
			if err != nil {
				return nil, err
			}

			eventUpdateResponse.Paymetns = append(eventUpdateResponse.Paymetns, struct {
				PaymentId uuid.UUID
				PaidTo    uuid.UUID
				Amount    int
			}{
				PaymentId: payment.ID,
				PaidTo:    user.ID,
				Amount:    payment.Amount,
			})
		}
		return eventUpdateResponse, nil
	})
	if err != nil {
		return nil, err
	}

	// event := v.(*model.Event)
	eventResponse := v.(dto.EventResponse)

	return &eventResponse, nil
}

func (e *eventUseCase) DeleteEvent(c context.Context, groupID uuid.UUID, eventID uuid.UUID, userID uuid.UUID) error {
	// ユーザーの取得
	user, err := e.userRepository.GetUserByUid(c, userID)
	if err != nil {
		return err
	}

	// グループを取得
	group, err := e.groupRepository.GetGroupById(c, groupID)
	if err != nil {
		return err
	}

	// グループにユーザーが所属するか確認
	_, err = e.groupUserRepository.GetGroupUser(c, group.ID, user.ID)
	if err != nil {
		return err
	}

	// 削除対象のイベント情報を取得
	event, err := e.eventRepository.GetEvent(c, eventID)
	if err != nil {
		return err
	}

	// 削除対象のイベント情報に紐づく支払い情報を取得
	payments, err := e.paymentRepository.GetPaymentByEventId(c, event.ID)
	if err != nil {
		return err
	}

	// 削除対象のイベントと支払いを削除
	_, err = e.transaction.DoInTx(c, func(ctx context.Context) (interface{}, error) {
		for _, payment := range payments {
			if err := e.paymentRepository.DeletePayment(c, payment.ID); err != nil {
				return nil, err
			}
		}

		err := e.eventRepository.DeleteEvent(c, eventID)
		if err != nil {
			return nil, err
		}

		return nil, nil
	})
	if err != nil {
		return err
	}

	return nil
}

func NewEventUseCase(eventRepo repository.EventRepository, userRepo repository.UserRepository, groupRepo repository.GroupRepository, groupUserRepo repository.GroupUserReopsitory, paymentRepo repository.PaymentRepository, tx repository.Transaction) EventUseCase {
	return &eventUseCase{
		eventRepository:     eventRepo,
		userRepository:      userRepo,
		groupRepository:     groupRepo,
		groupUserRepository: groupUserRepo,
		paymentRepository:   paymentRepo,
		transaction:         tx,
	}
}

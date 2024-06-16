package handler

import (
	"net/http"
	"time"

	"github.com/datti-api/pkg/interface/request"
	"github.com/datti-api/pkg/interface/response"
	"github.com/datti-api/pkg/usecase"
	"github.com/datti-api/pkg/usecase/dto"
	"github.com/labstack/echo/v4"
)

type EventHandler interface {
	HandleGet(c echo.Context) error
	HandleGetById(c echo.Context) error
	HandleCreate(c echo.Context) error
	HandleUpdate(c echo.Context) error
}

type eventHandler struct {
	useCase usecase.EventUseCase
}

// HandleCreate implements EventHandler.
func (e *eventHandler) HandleCreate(c echo.Context) error {
	errResponse := new(response.Error)
	uid := c.Get("uid").(string)
	gid := c.Param("groupId")
	req := new(request.EventCreateRequest)
	if err := c.Bind(req); err != nil {
		errResponse.Error = err.Error()
		return c.JSON(http.StatusBadRequest, errResponse)
	}
	req.CreatedBy = uid
	req.GroupId = gid

	// ユースケース層のDTOの詰め替え
	eventDTO := request.ToEventCreate(req)

	event, err := e.useCase.CreateEvent(c.Request().Context(), uid, gid, eventDTO)
	if err != nil {
		errResponse.Error = err.Error()
		return c.JSON(http.StatusInternalServerError, errResponse)
	} else {
		// レスポンスに詰め替え
		payments := make([]struct {
			PaymentId string `json:"payment_id"`
			PaidTo    string `json:"paid_to"`
			Amount    int    `json:"amount"`
		}, len(event.Paymetns))

		for i, p := range event.Paymetns {
			payments[i] = struct {
				PaymentId string `json:"payment_id"`
				PaidTo    string `json:"paid_to"`
				Amount    int    `json:"amount"`
			}{
				PaymentId: p.PaymentId,
				PaidTo:    p.PaidTo,
				Amount:    p.Amount,
			}
		}

		res := &response.Event{
			ID:        event.ID,
			Name:      event.Name,
			EventedAt: event.EventedAt,
			CreatedBy: event.CreatedBy,
			PaidBy:    event.CreatedBy,
			Amount:    event.Amount,
			Payments:  payments,
			GroupId:   event.GroupId,
		}
		return c.JSON(http.StatusOK, res)
	}
}

// HandleGet implements EventHandler.
func (e *eventHandler) HandleGet(c echo.Context) error {
	errResponse := new(response.Error)
	id := c.Param("id")

	event, err := e.useCase.GetEvent(c.Request().Context(), id)
	if err != nil {
		errResponse.Error = err.Error()
		return c.JSON(http.StatusInternalServerError, errResponse)
	} else {
		res := response.Event{
			ID:        event.ID,
			Name:      event.Name,
			EventedAt: event.EventedAt,
			CreatedBy: event.CreatedBy,
			Amount:    event.Amount,
			Payments: []struct {
				PaymentId string `json:"payment_id"`
				PaidTo    string `json:"paid_to"`
				Amount    int    `json:"amount"`
			}(event.Paymetns),
			GroupId: event.GroupId,
		}
		return c.JSON(http.StatusOK, res)
	}
}

// HandleGetById implements EventHandler.
func (e *eventHandler) HandleGetById(c echo.Context) error {
	errResponse := new(response.Error)
	gid := c.Param("gid")
	res := &response.Events{
		Events: make([]struct {
			ID        string    `json:"id"`
			Name      string    `json:"name"`
			EventedAt time.Time `json:"evented_at"`
			PaidBy    struct {
				ID   string `json:"id"`
				Name string `json:"name"`
			} `json:"paid_by"`
			Amount int `json:"amount"`
		}, 0),
	}
	events, err := e.useCase.GetEvents(c.Request().Context(), gid)
	if err != nil {
		errResponse.Error = err.Error()
		return c.JSON(http.StatusInternalServerError, errResponse)
	} else {
		if events == nil {
			return c.JSON(http.StatusOK, res.Events)
		} else {
			for _, event := range events.Events {
				res.Events = append(res.Events, struct {
					ID        string    `json:"id"`
					Name      string    `json:"name"`
					EventedAt time.Time `json:"evented_at"`
					PaidBy    struct {
						ID   string `json:"id"`
						Name string `json:"name"`
					} `json:"paid_by"`
					Amount int `json:"amount"`
				}{
					ID:        event.ID,
					Name:      event.Name,
					EventedAt: event.EventedAt,
					PaidBy: struct {
						ID   string `json:"id"`
						Name string `json:"name"`
					}{
						ID:   event.PaidBy.ID,
						Name: event.PaidBy.Name,
					},
					Amount: event.Amount,
				})
			}
			return c.JSON(http.StatusOK, res)
		}
	}
}

// HandleUpdate implements EventHandler.
func (e *eventHandler) HandleUpdate(c echo.Context) error {
	errResponse := new(response.Error)
	id := c.Param("eventId")
	gid := c.Param("groupId")
	uid := c.Get("uid").(string)
	req := new(request.EventUpdateRequest)
	if err := c.Bind(req); err != nil {
		errResponse.Error = err.Error()
		return c.JSON(http.StatusBadRequest, errResponse)
	}
	req.ID = id
	req.GroupId = gid
	req.CreatedBy = uid

	// ユースケース層のDTOへ詰め替え
	payments := make([]struct {
		PaymentID string
		PaidTo    string
		Amount    int
	}, len(req.Payments))

	for i, p := range req.Payments {
		payments[i] = struct {
			PaymentID string
			PaidTo    string
			Amount    int
		}{
			PaymentID: p.ID,
			PaidTo:    p.PaidTo,
			Amount:    p.Amount,
		}
	}

	eventUpdateRequest := &dto.EventUpdate{
		Name:      req.Name,
		EventedAt: req.EventedAt,
		CreatedBy: req.CreatedBy,
		PaidBy:    req.PaidBy,
		Amount:    req.Amount,
		Payments:  payments,
		GroupId:   req.GroupId,
	}

	// ユースケースのUpdateEventを呼び出す
	event, err := e.useCase.UpdateEvent(c.Request().Context(), id, uid, gid, eventUpdateRequest)
	if err != nil {
		errResponse.Error = err.Error()
		return c.JSON(http.StatusInternalServerError, errResponse)
	} else {
		// レスポンスに詰め替え
		payments := make([]struct {
			PaymentId string `json:"payment_id"`
			PaidTo    string `json:"paid_to"`
			Amount    int    `json:"amount"`
		}, len(event.Paymetns))

		for i, p := range event.Paymetns {
			payments[i] = struct {
				PaymentId string `json:"payment_id"`
				PaidTo    string `json:"paid_to"`
				Amount    int    `json:"amount"`
			}{
				PaymentId: p.PaymentId,
				PaidTo:    p.PaidTo,
				Amount:    p.Amount,
			}
		}

		res := &response.Event{
			ID:        event.ID,
			Name:      event.Name,
			EventedAt: event.EventedAt,
			CreatedBy: event.CreatedBy,
			PaidBy:    event.CreatedBy,
			Amount:    event.Amount,
			Payments:  payments,
			GroupId:   event.GroupId,
		}
		return c.JSON(http.StatusOK, res)
	}
}

func NewEventHandler(eventUseCase usecase.EventUseCase) EventHandler {
	return &eventHandler{
		useCase: eventUseCase,
	}
}

package handler

import (
	"net/http"

	"github.com/datti-api/pkg/domain/model"
	"github.com/datti-api/pkg/interface/request"
	"github.com/datti-api/pkg/interface/response"
	"github.com/datti-api/pkg/usecase"
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
	gid := c.Param("gid")
	req := new(request.EventCreate)
	res := new(response.Event)
	if err := c.Bind(req); err != nil {
		errResponse.Error = err.Error()
		return c.JSON(http.StatusBadRequest, errResponse)
	}

	event, user, err := e.useCase.CreateEvent(c.Request().Context(), uid, gid, req.Name, req.Evented_at)
	if err != nil {
		errResponse.Error = err.Error()
		return c.JSON(http.StatusInternalServerError, errResponse)
	} else {
		res.ID = event.ID
		res.Name = event.Name
		res.EventedAt = event.EventedAt
		res.CreatedBy = user
		res.GroupId = event.GroupId
		return c.JSON(http.StatusOK, res)
	}
}

// HandleGet implements EventHandler.
func (e *eventHandler) HandleGet(c echo.Context) error {
	errResponse := new(response.Error)
	id := c.Param("id")
	res := new(response.Event)

	event, user, err := e.useCase.GetEvent(c.Request().Context(), id)
	if err != nil {
		errResponse.Error = err.Error()
		return c.JSON(http.StatusInternalServerError, errResponse)
	} else {
		res.ID = event.ID
		res.Name = event.Name
		res.EventedAt = event.EventedAt
		res.CreatedBy = user
		res.GroupId = event.GroupId
		return c.JSON(http.StatusOK, res)
	}
}

// HandleGetById implements EventHandler.
func (e *eventHandler) HandleGetById(c echo.Context) error {
	errResponse := new(response.Error)
	gid := c.Param("gid")
	res := new(response.Events)

	events, err := e.useCase.GetEvents(c.Request().Context(), gid)
	if err != nil {
		errResponse.Error = err.Error()
		return c.JSON(http.StatusInternalServerError, errResponse)
	} else {
		if events == nil {
			res.Events = make([]*model.Event, 0)
			return c.JSON(http.StatusOK, res)
		} else {
			res.Events = events
			return c.JSON(http.StatusOK, res)
		}
	}
}

// HandleUpdate implements EventHandler.
func (e *eventHandler) HandleUpdate(c echo.Context) error {
	errResponse := new(response.Error)
	id := c.Param("id")
	gid := c.Param("gid")
	uid := c.Get("uid").(string)
	req := new(request.EventCreate)
	res := new(response.Event)
	if err := c.Bind(req); err != nil {
		errResponse.Error = err.Error()
		return c.JSON(http.StatusBadRequest, errResponse)
	}

	event, user, err := e.useCase.UpdateEvent(c.Request().Context(), id, uid, gid, req.Name, req.Evented_at)
	if err != nil {
		errResponse.Error = err.Error()
		return c.JSON(http.StatusInternalServerError, errResponse)
	} else {
		res.ID = event.ID
		res.Name = event.Name
		res.EventedAt = event.EventedAt
		res.CreatedBy = user
		res.GroupId = event.GroupId
		return c.JSON(http.StatusOK, res)
	}
}

func NewEventHandler(eventUseCase usecase.EventUseCase) EventHandler {
	return &eventHandler{
		useCase: eventUseCase,
	}
}

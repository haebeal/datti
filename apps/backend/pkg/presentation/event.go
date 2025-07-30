package api

import (
	"net/http"
	"time"

	"github.com/haebeal/datti/pkg/application"
	"github.com/labstack/echo/v4"
)

type EventHandler struct {
	eu *application.EventUseCase
}

type CreateEventRequest struct {
	Name      string    `query:"name"`
	EventDate time.Time `query:"eventDate"`
}

type EventResponse struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	EventDate time.Time `json:"eventDate"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

func NewEventHandler(eu *application.EventUseCase) *EventHandler {
	return &EventHandler{
		eu: eu,
	}
}

func (eh *EventHandler) HandlePost(c echo.Context) error {
	var request CreateEventRequest
	if err := c.Bind(&request); err != nil {
		return c.String(http.StatusBadRequest, err.Error())
	}

	event, err := eh.eu.Create(request.Name, request.EventDate)
	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusCreated, &EventResponse{
		ID:        event.ID().String(),
		Name:      event.Name(),
		EventDate: event.EventDate(),
		CreatedAt: event.CreatedAt(),
		UpdatedAt: event.UpdatedAt(),
	})
}

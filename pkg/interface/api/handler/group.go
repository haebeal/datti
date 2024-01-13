package handler

import (
	"github.com/datti-api/pkg/usecase"
	"github.com/gin-gonic/gin"
)

type GroupHandler interface {
	HandleCreate(c *gin.Context)
	HandleGet(c *gin.Context)
	HandleUpdate(c *gin.Context)
}

type groupHandler struct {
	useCase usecase.GroupUseCase
}

func NewGroupHandler(groupUseCase usecase.GroupUseCase) GroupHandler {
	return &groupHandler{
		useCase: groupUseCase,
	}
}

// HandleCreate implements GroupHandler.
func (gh *groupHandler) HandleCreate(c *gin.Context) {
	panic("unimplemented")
}

// HandleGet implements GroupHandler.
func (gh *groupHandler) HandleGet(c *gin.Context) {
	panic("unimplemented")
}

// HandleUpdate implements GroupHandler.
func (gh *groupHandler) HandleUpdate(c *gin.Context) {
	panic("unimplemented")
}

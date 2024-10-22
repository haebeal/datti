package handler

import (
	"net/http"

	"github.com/datti-api/pkg/domain/model"
	"github.com/datti-api/pkg/interface/request"
	"github.com/datti-api/pkg/interface/response"
	"github.com/datti-api/pkg/usecase"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

type GroupHandler interface {
	HandleGet(c echo.Context) error
	HandleCreate(c echo.Context) error
	HandleGetById(c echo.Context) error
	HandleGetMembers(c echo.Context) error
	HandleUpdate(c echo.Context) error
	HandleRegisterd(c echo.Context) error
}

type groupHandler struct {
	useCase usecase.GroupUseCase
}

// HandleCreate implements GroupHandler.
func (g *groupHandler) HandleCreate(c echo.Context) error {
	errResponse := new(response.Error)
	userID, err := uuid.Parse(c.Get("uid").(string))
	if err != nil {
		return c.JSON(http.StatusInternalServerError, errResponse)
	}
	req := new(request.GroupCreate)
	if err := c.Bind(req); err != nil {
		errResponse.Error = err.Error()
		return c.JSON(http.StatusInternalServerError, errResponse)
	}
	group, members, statuses, err := g.useCase.CreateGroup(c.Request().Context(), req.Name, userID, req.Uids)
	if err != nil {
		errResponse.Error = err.Error()
		return c.JSON(http.StatusInternalServerError, errResponse)
	} else {
		res := new(response.GroupMembers)
		res.ID = group.ID
		res.Name = group.Name
		for i, member := range members {
			res.Members = append(res.Members, struct {
				UID      uuid.UUID `json:"userId"`
				Name     string    `json:"name"`
				Email    string    `json:"email"`
				PhotoUrl string    `json:"photoUrl"`
				Status   string    `json:"status"`
			}{
				UID:      member.ID,
				Name:     member.Name,
				Email:    member.Email,
				PhotoUrl: member.PhotoUrl,
				Status:   *statuses[i],
			})
		}
		return c.JSON(http.StatusOK, res)
	}
}

// HandleGet implements GroupHandler.
func (g *groupHandler) HandleGet(c echo.Context) error {
	errResponse := new(response.Error)
	res := new(response.Groups)
	userID, err := uuid.Parse(c.Get("uid").(string))
	if err != nil {
		return c.JSON(http.StatusInternalServerError, err.Error())
	}

	groups, err := g.useCase.GetGroups(c.Request().Context(), userID)
	if err != nil {
		errResponse.Error = err.Error()
		return c.JSON(http.StatusInternalServerError, errResponse)
	} else {
		for _, group := range groups {
			res.Groups = append(res.Groups, struct {
				ID   uuid.UUID `json:"groupId"`
				Name string    `json:"name"`
			}{
				ID:   group.ID,
				Name: group.Name,
			})
		}
		return c.JSON(http.StatusOK, res)
	}
}

// HandleGetById implements GroupHandler.
func (g *groupHandler) HandleGetById(c echo.Context) error {
	errResponse := new(response.Error)
	res := response.Group{}
	groupID, err := uuid.Parse(c.Param("groupId"))
	if err != nil {
		return c.JSON(http.StatusInternalServerError, err.Error())
	}

	group, err := g.useCase.GetGroupById(c.Request().Context(), groupID)
	if err != nil {
		errResponse.Error = err.Error()
		return c.JSON(http.StatusInternalServerError, errResponse)
	} else {
		res.ID = group.ID
		res.Name = group.Name
		return c.JSON(http.StatusOK, res)
	}
}

// HandleGetMembers implements GroupHandler.
func (g *groupHandler) HandleGetMembers(c echo.Context) error {
	errResponse := new(response.Error)
	res := new(response.Members)
	userID, err := uuid.Parse(c.Get("uid").(string))
	if err != nil {
		return c.JSON(http.StatusInternalServerError, err.Error())
	}
	groupID, err := uuid.Parse(c.Param("groupId"))
	if err != nil {
		return c.JSON(http.StatusInternalServerError, err.Error())
	}

	status := c.QueryParam("status")

	members, statuses, err := g.useCase.GetMembers(c.Request().Context(), groupID, userID, status)
	if err != nil {
		errResponse.Error = err.Error()
		return c.JSON(http.StatusInternalServerError, errResponse)
	} else {
		for i, member := range members {
			res.Members = append(res.Members, struct {
				UID      uuid.UUID `json:"userId"`
				Name     string    `json:"name"`
				Email    string    `json:"email"`
				PhotoUrl string    `json:"photoUrl"`
				Status   string    `json:"status"`
			}{
				UID:      member.ID,
				Name:     member.Name,
				Email:    member.Email,
				PhotoUrl: member.PhotoUrl,
				Status:   *statuses[i],
			})
		}

		return c.JSON(http.StatusOK, res)
	}
}

// HandleRegisterd implements GroupHandler.
func (g *groupHandler) HandleRegisterd(c echo.Context) error {
	req := new(request.Uids)
	errResponse := new(response.Error)
	userID, err := uuid.Parse(c.Get("uid").(string))
	if err != nil {
		return c.JSON(http.StatusInternalServerError, err.Error())
	}

	groupID, err := uuid.Parse(c.Param("groupId"))
	if err != nil {
		return c.JSON(http.StatusInternalServerError, err.Error())
	}

	if err := c.Bind(req); err != nil {
		errResponse.Error = err.Error()
		return c.JSON(http.StatusInternalServerError, errResponse)
	}

	group, members, statuses, err := g.useCase.RegisterdMembers(c.Request().Context(), userID, groupID, req.Uids)
	if err != nil {
		errResponse.Error = err.Error()
		return c.JSON(http.StatusInternalServerError, errResponse)
	} else {
		res := new(response.GroupMembers)
		res.ID = group.ID
		res.Name = group.Name
		for i, member := range members {
			res.Members = append(res.Members, struct {
				UID      uuid.UUID `json:"userId"`
				Name     string    `json:"name"`
				Email    string    `json:"email"`
				PhotoUrl string    `json:"photoUrl"`
				Status   string    `json:"status"`
			}{
				UID:      member.ID,
				Name:     member.Name,
				Email:    member.Email,
				PhotoUrl: member.PhotoUrl,
				Status:   *statuses[i],
			})
		}
		return c.JSON(http.StatusOK, res)
	}
}

// HandleUpdate implements GroupHandler.
func (g *groupHandler) HandleUpdate(c echo.Context) error {
	req := new(request.GroupUpdate)
	errResponse := new(response.Error)
	groupID, err := uuid.Parse(c.Param("groupId"))
	if err != nil {
		return c.JSON(http.StatusInternalServerError, err.Error())
	}

	if err := c.Bind(req); err != nil {
		errResponse.Error = err.Error()
		return c.JSON(http.StatusInternalServerError, errResponse)
	}

	group, members, err := g.useCase.UpdateGroup(c.Request().Context(), groupID, req.Name)
	if err != nil {
		errResponse.Error = err.Error()
		return c.JSON(http.StatusInternalServerError, errResponse)
	} else {
		return c.JSON(http.StatusOK, struct {
			ID    uuid.UUID     `json:"groupId"`
			Name  string        `json:"name"`
			Users []*model.User `json:"users"`
		}{
			ID:    group.ID,
			Name:  group.Name,
			Users: members,
		})
	}
}

func NewGroupHandler(groupUseCase usecase.GroupUseCase) GroupHandler {
	return &groupHandler{
		useCase: groupUseCase,
	}
}

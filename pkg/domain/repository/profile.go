package repository

import (
	"context"

	"github.com/datti-api/pkg/domain/model"
)

type ProfileRepository interface {
	GetProfile(c context.Context, uid string) (*model.Profile, error)
	UpdateProfile(c context.Context, uid string, name string, url string) (*model.Profile, error)
}

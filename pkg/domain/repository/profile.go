package repository

import (
	"context"

	"github.com/datti-api/pkg/domain/model"
)

type ProfileRepository interface {
	GetProfile(c context.Context, idToken string, uid string) (*model.Profile, error)
	UpdateProfile(c context.Context, idToken string, uid string, name string, url string) (*model.Profile, error)
	GetProfileByEmail(c context.Context, idToken string, email string) (*model.Profile, error)
}

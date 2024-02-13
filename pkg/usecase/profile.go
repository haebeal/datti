package usecase

import (
	"context"

	"github.com/datti-api/pkg/domain/model"
	"github.com/datti-api/pkg/domain/repository"
)

type ProflielUseCase interface {
	GetProfile(c context.Context, idToken string, uid string) (*model.Profile, error)
	UpdateProfile(c context.Context, idToken string, uid string, name string, url string) (*model.Profile, error)
}

type profilelUsecase struct {
	repository repository.ProfileRepository
}

// GetProfile implements ProflielUseCase.
func (pu *profilelUsecase) GetProfile(c context.Context, idToken string, uid string) (*model.Profile, error) {
	profile, err := pu.repository.GetProfile(c, idToken, uid)
	if err != nil {
		return nil, err
	}

	return profile, nil
}

// UpdateProfile implements ProflielUseCase.
func (pu *profilelUsecase) UpdateProfile(c context.Context, idToken string, uid string, name string, url string) (*model.Profile, error) {
	profile, err := pu.repository.UpdateProfile(c, idToken, uid, name, url)
	if err != nil {
		return nil, err
	}

	return profile, nil
}

func NewProfileUseCase(profileRepo repository.ProfileRepository) ProflielUseCase {
	return &profilelUsecase{
		repository: profileRepo,
	}
}

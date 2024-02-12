package usecase

import (
	"context"

	"github.com/datti-api/pkg/domain/model"
	"github.com/datti-api/pkg/domain/repository"
)

type ProflielUseCase interface {
	GetProfile(c context.Context, uid string) (*model.Profile, error)
	UpdateProfile(c context.Context, name string, url string) (*model.Profile, error)
}

type profilelUsecase struct {
	repository repository.ProfileRepository
}

// GetProfile implements ProflielUseCase.
func (*profilelUsecase) GetProfile(c context.Context, uid string) (*model.Profile, error) {
	panic("unimplemented")
}

// UpdateProfile implements ProflielUseCase.
func (*profilelUsecase) UpdateProfile(c context.Context, name string, url string) (*model.Profile, error) {
	panic("unimplemented")
}

func NewProfileUseCase(profileRepo repository.ProfileRepository) ProflielUseCase {
	return &profilelUsecase{
		repository: profileRepo,
	}
}

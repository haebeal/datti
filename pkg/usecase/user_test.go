package usecase_test

import (
	"context"
	"testing"

	"github.com/datti-api/pkg/domain/model"
	"github.com/datti-api/pkg/infrastructure/database"
	"github.com/datti-api/pkg/infrastructure/repositoryimpl"
	"github.com/datti-api/pkg/usecase"
)

func TestCreateUser(t *testing.T) {
	c := context.Background()
	user := new(model.User)
	user.Name = "tasak"
	user.Email = "vividnasubi@gmail.com"
	dsn := "host=localhost user=postgres password=root dbname=datti_db port=5432 sslmode=disable TimeZone=Asia/Tokyo"
	db, _ := database.NewDBEngine(dsn)
	repo := repositoryimpl.NewUserRepoImpl(db)
	uu := usecase.NewUserUseCase(repo)
	newUser, err := uu.CreateUser(c, user)
	if err != nil {
		t.Fatalf("Failed User Create %v", err)
	}

	if newUser == nil {
		t.Fatalf("Failed User Create")
	}

	if newUser.Name == "" {
		t.Fatalf("Failed User Create")
	}

	if newUser.Email == "" {
		t.Fatalf("Failed User Create")
	}
}

func TestGetUserByEmail(t *testing.T) {
	c := context.Background()
	user := new(model.User)
	user.Name = "tasak"
	user.Email = "vividnasubi@gmail.com"
	dsn := "host=localhost user=postgres password=root dbname=datti_db port=5432 sslmode=disable TimeZone=Asia/Tokyo"
	db, _ := database.NewDBEngine(dsn)
	repo := repositoryimpl.NewUserRepoImpl(db)
	uu := usecase.NewUserUseCase(repo)
	uu.CreateUser(c, user)
	findUser, err := uu.GetUserByEmail(c, user)
	if err != nil {
		t.Fatalf("Failed User Record Not Found %v", err)
	}

	if findUser == nil {
		t.Fatalf("Failed User Record")
	}

	if findUser.Name == "" {
		t.Fatalf("Invalid User Name %s", findUser.Name)
	}

	if findUser.Email == "" {
		t.Fatalf("Invalid User Email %s", findUser.Email)
	}
}

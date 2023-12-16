package server

import (
	"github.com/datti-api/pkg/infrastructure/database"
	repositoryimpl "github.com/datti-api/pkg/infrastructure/repositoryImpl"
	"github.com/datti-api/pkg/interface/api/handler"
	"github.com/datti-api/pkg/usecase"
	"github.com/gin-gonic/gin"
)

func Sever(dsn string) {
	dbEngine, err := database.NewDBEngine(dsn)
	if err != nil {
		panic(err)
	}

	// 依存性の解決
	userRepository := repositoryimpl.NewUserRepoImpl(dbEngine)
	userUseCase := usecase.NewUserUseCase(userRepository)
	userHandler := handler.NewUserHandler(userUseCase)

	r := gin.Default()

	api := r.Group("/api")
	{
		me := api.Group("/me")
		{
			me.GET("/", userHandler.HandlerGet)
			me.POST("/", userHandler.HandlerCreate)
			me.PUT("/", userHandler.HandlerUpdate)
		}
	}

	if err := r.Run(":8080"); err != nil {
		panic(err)
	}
}

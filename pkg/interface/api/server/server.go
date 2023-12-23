package server

import (
	"github.com/datti-api/pkg/infrastructure/database"
	repositoryimpl "github.com/datti-api/pkg/infrastructure/repositoryimpl"
	"github.com/datti-api/pkg/interface/api/handler"
	"github.com/datti-api/pkg/usecase"
	"github.com/datti-api/pkg/utils"
	"github.com/gin-contrib/cors"
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
	r.Use(utils.PeopleMmiddleware)

	config := cors.DefaultConfig()
	config.AllowOrigins = []string{
		"http://localhost:3000",
	}
	config.AddAllowHeaders(
		"Authorization",
		"Access-Token",
		"Access-Control-Allow-Headers",
		"Access-Control-Allow-Origin",
	)
	config.AddAllowMethods(
		"GET",
		"POST",
		"PUT",
	)
	config.AllowCredentials = true
	// cros設定
	r.Use(cors.New(config))

	api := r.Group("/api")
	{
		me := api.Group("/me")
		{
			// me.GET("/", userHandler.HandlerGet)
			me.POST("/", userHandler.HandlerCreate)
			me.PUT("/", userHandler.HandlerUpdate)
			me.GET("/", userHandler.HandleSingIn)
		}
	}

	if err := r.Run(":8080"); err != nil {
		panic(err)
	}
}

package server

import (
	"fmt"

	"github.com/datti-api/pkg/infrastructure/database"
	"github.com/datti-api/pkg/infrastructure/repositoryimpl"
	"github.com/datti-api/pkg/interface/api/handler"
	"github.com/datti-api/pkg/usecase"
	"github.com/datti-api/pkg/utils"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func Sever(dsn string) {
	dbEngine, err := database.NewDBEngine(dsn)
	if err != nil {
		fmt.Print(err.Error())
	}

	// 依存性の解決
	userRepository := repositoryimpl.NewUserRepoImpl(dbEngine)
	userUseCase := usecase.NewUserUseCase(userRepository)
	userHandler := handler.NewUserHandler(userUseCase)

	// ルーターの生成
	r := gin.Default()
	r.Use(utils.PeopleMmiddleware)

	// cros設定
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
	r.Use(cors.New(config))

	// アクセスポイントの設定
	api := r.Group("/api")
	{
		me := api.Group("/me")
		{
			me.GET("/", userHandler.HandlerGet)
			me.POST("/", userHandler.HandlerCreate)
			me.PUT("/", userHandler.HandlerUpdate)
		}
	}

	if err := r.Run("0.0.0.0:8080"); err != nil {
		panic(err)
	}
}

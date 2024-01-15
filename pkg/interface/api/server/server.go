package server

import (
	"log"

	"github.com/datti-api/pkg/infrastructure/database"
	"github.com/datti-api/pkg/infrastructure/repositoryimpl"
	"github.com/datti-api/pkg/interface/api/handler"
	"github.com/datti-api/pkg/interface/api/middleware"
	"github.com/datti-api/pkg/usecase"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func Sever(dsn string, hostName string, dbInit bool) {
	// DBインスタンスの生成
	dbEngine, err := database.NewDBEngine(dsn, dbInit)
	if err != nil {
		log.Print(err.Error())
	}

	// 依存性の解決
	userRepository := repositoryimpl.NewUserRepoImpl(dbEngine)
	userUseCase := usecase.NewUserUseCase(userRepository)
	userHandler := handler.NewUserHandler(userUseCase)

	groupRepository := repositoryimpl.NewGropuRepoImpl(dbEngine)
	groupUseCase := usecase.NewGroupUseCase(groupRepository)
	groupHandler := handler.NewGroupHandler(groupUseCase)

	// ルーターの生成
	r := gin.Default()

	// cors設定
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{
		"http://localhost:3000",
		"https://datti-dev.haebeal.net",
		"https://datti-reg.haebeal.net",
	}
	config.AddAllowHeaders(
		"Authorization",
	)
	r.Use(cors.New(config))
	r.Use(middleware.AuthorizationApiMiddleware)
	r.Use(middleware.ManagementApiMiddlewaer)
	// r.Use(utils.PeopleMmiddleware)

	// エンドポイントの設定
	api := r.Group("/api")
	{
		me := api.Group("/me")
		{
			me.GET("/", userHandler.HandlerGet)
			me.POST("/", userHandler.HandlerCreate)
			me.PUT("/", userHandler.HandlerUpdate)
		}
		groups := api.Group("/groups")
		{
			groups.GET("/", groupHandler.HandleGet)
			groups.POST("/", groupHandler.HandleCreate)
			groups.GET("/:id", groupHandler.HandleGetById)
			groups.PUT("/:id", groupHandler.HandleUpdate)
		}
	}

	if err := r.Run(hostName + ":8080"); err != nil {
		panic(err)
	}
}

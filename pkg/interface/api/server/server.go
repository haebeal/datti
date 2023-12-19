package server

import (
	"github.com/datti-api/pkg/infrastructure/database"
	repositoryimpl "github.com/datti-api/pkg/infrastructure/repositoryimpl"
	"github.com/datti-api/pkg/interface/api/handler"
	"github.com/datti-api/pkg/usecase"
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
		"OPTIONS",
	)
	config.AllowCredentials = true
	// cros設定
	r.Use(cors.New(config))
	// r.Use(cors.New(cors.Config{
	// 	// アクセスを許可したいアクセス元
	// 	AllowOrigins: []string{
	// 		"http://192.168.10.109:3000",
	// 	},
	// 	// アクセスを許可したいHTTPメソッド(以下の例だとPUTやDELETEはアクセスできません)
	// 	AllowMethods: []string{
	// 		"POST",
	// 		"GET",
	// 		"PUT",
	// 	},
	// 	// 許可したいHTTPリクエストヘッダ
	// 	AllowHeaders: []string{
	// 		"Access-Control-Allow-Credentials",
	// 		"Access-Control-Allow-Headers",
	// 		"Access-Control-Allow-Origin",
	// 		"Content-Type",
	// 		"Content-Length",
	// 		"Accept-Encoding",
	// 		"Authorization",
	// 	},
	// 	// cookieなどの情報を必要とするかどうか
	// 	AllowCredentials: true,
	// 	// preflightリクエストの結果をキャッシュする時間
	// 	MaxAge: 24 * time.Hour,
	// }))

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

package server

import (
	"log"
	"net/http"

	"github.com/datti-api/pkg/infrastructure/database"
	"github.com/datti-api/pkg/infrastructure/repositoryimpl"
	"github.com/datti-api/pkg/interface/api/handler"
	auth "github.com/datti-api/pkg/interface/api/middleware"
	"github.com/datti-api/pkg/usecase"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func Sever(dsn string, hostName string, dbInit bool) {
	// DBインスタンスの生成
	dbEngine, err := database.NewDBEngine(dsn, dbInit)
	if err != nil {
		log.Print(err.Error())
	}

	// 依存性の解決
	// groupRepository := repositoryimpl.NewGropuRepoImpl(dbEngine)
	// groupUseCase := usecase.NewGroupUseCase(groupRepository)
	// groupHandler := handler.NewGroupHandler(groupUseCase)

	transaction := repositoryimpl.NewTransaction(dbEngine.Engine)

	bankAccountRepository := repositoryimpl.NewBankAccountRepository(dbEngine)
	bankAccountUseCase := usecase.NewBankAccountUseCase(bankAccountRepository, transaction)
	bankAccountHandler := handler.NewBankAccountHandler(bankAccountUseCase)

	r := echo.New()
	r.Pre(middleware.RemoveTrailingSlash())

	// CORS許可の設定
	r.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{"*"},
		AllowHeaders: []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept, echo.HeaderAuthorization},
		AllowMethods: []string{http.MethodGet, http.MethodPost, http.MethodPut, http.MethodDelete, http.MethodHead},
	}))
	r.Use(auth.FirebaseAuthMiddleware())

	r.GET("/bank", bankAccountHandler.HandleGet)
	r.POST("/bank", bankAccountHandler.HandleUpsert)
	r.DELETE("/bank", bankAccountHandler.HandleDelete)
	r.Start("0.0.0.0:8080")
	// ルーターの生成
	// r := gin.Default()

	// // corsとミドルウェアの設定
	// config := cors.DefaultConfig()
	// config.AllowAllOrigins = true
	// config.AddAllowHeaders("Authorization")
	// r.Use(cors.New(config))
	// r.Use(middleware.FirebaseAuthMiddleware)

	// // エンドポイントの設定
	// //
	// me := r.Group("/bank")
	// {
	// 	me.GET("", bankAccountHandler.HandleGet)
	// 	me.POST("", bankAccountHandler.HandleUpsert)
	// 	me.DELETE("", bankAccountHandler.HandleDelete)
	// }

	// // グループ
	// groups := r.Group("/groups")
	// {
	// 	groups.GET("/", groupHandler.HandleGet)
	// 	groups.POST("/", groupHandler.HandleCreate)
	// 	groups.GET("/:id/", groupHandler.HandleGetById)
	// 	groups.PUT("/:id/", groupHandler.HandleUpdate)
	// }

	// if err := r.Run(hostName + ":8080"); err != nil {
	// 	panic(err)
	// }
}

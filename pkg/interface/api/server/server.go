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
	dbClient, err := database.NewBunClient(dsn)
	if err != nil {
		log.Print(err.Error())
	}

	tenantClient, err := database.NewFireBaseClient()
	if err != nil {
		log.Print(err.Error())
	}

	// 依存性の解決
	// groupRepository := repositoryimpl.NewGropuRepoImpl(dbEngine)
	// groupUseCase := usecase.NewGroupUseCase(groupRepository)
	// groupHandler := handler.NewGroupHandler(groupUseCase)

	transaction := repositoryimpl.NewTransaction(dbClient.Client)

	profileRepository := repositoryimpl.NewProfileRepoImpl(tenantClient)
	profileUseCase := usecase.NewProfileUseCase(profileRepository)
	profileHandler := handler.NewProfileHandler(profileUseCase)

	bankAccountRepository := repositoryimpl.NewBankAccountRepository(dbClient)
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

	r.GET("/me", profileHandler.HandleGet)
	r.PUT("/me", profileHandler.HandleUpdate)

	r.GET("/users", profileHandler.HandleGetByEmail)

	r.GET("/bank", bankAccountHandler.HandleGet)
	r.POST("/bank", bankAccountHandler.HandleUpsert)
	r.DELETE("/bank", bankAccountHandler.HandleDelete)
	r.Start("0.0.0.0:8080")
}

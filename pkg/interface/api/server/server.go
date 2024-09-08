package server

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"time"

	"github.com/datti-api/pkg/infrastructure/database"
	"github.com/datti-api/pkg/infrastructure/repositoryimpl"
	"github.com/datti-api/pkg/interface/api/handler"
	auth "github.com/datti-api/pkg/interface/api/middleware"
	"github.com/datti-api/pkg/usecase"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func Sever(dsn string, hostName string) {
	// DBインスタンスの生成
	dbClient, err := database.NewBunClient(dsn)
	if err != nil {
		log.Print(err.Error())
	}

	// 依存性の解決
	transaction := repositoryimpl.NewTransaction(dbClient.Client)

	userRepository := repositoryimpl.NewProfileRepoImpl(dbClient)
	friendRepository := repositoryimpl.NewFriendRepository(dbClient)
	userUseCase := usecase.NewUserUseCase(userRepository, friendRepository, transaction)
	userHandler := handler.NewUserHandler(userUseCase)

	groupUserRepository := repositoryimpl.NewGroupUserRepository(dbClient)

	groupRepository := repositoryimpl.NewGropuRepoImpl(dbClient)
	groupUseCase := usecase.NewGroupUseCase(groupRepository, userRepository, friendRepository, groupUserRepository, transaction)
	groupHandler := handler.NewGroupHandler(groupUseCase)

	paymentRepository := repositoryimpl.NewPaymentRepository(dbClient)
	paymentUseCase := usecase.NewPaymentUseCase(paymentRepository, userRepository, transaction)
	paymentHandler := handler.NewPaymentHandler(paymentUseCase)

	eventRepository := repositoryimpl.NewEventRepository(dbClient)
	eventUseCase := usecase.NewEventUseCase(eventRepository, userRepository, groupRepository, groupUserRepository, paymentRepository, transaction)
	eventHandler := handler.NewEventHandler(eventUseCase)

	r := echo.New()
	r.Pre(middleware.RemoveTrailingSlash())

	// CORS許可の設定
	r.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{"*"},
		AllowHeaders: []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept, echo.HeaderAuthorization},
		AllowMethods: []string{http.MethodGet, http.MethodPost, http.MethodPut, http.MethodDelete, http.MethodHead},
	}))
	r.Use(auth.AuthMiddleware())

	r.GET("/users", userHandler.HandleGetByEmail)
	r.GET("/users/me", userHandler.HandleGetByUid)
	r.PUT("/users/me", userHandler.HandleUpdate)
	r.GET("/users/:userId", userHandler.HandleGetByUidWithPahtParam)
	r.POST("/users/:userId/requests", userHandler.HandlerFriendRequest) //フレンド申請を送信
	r.DELETE("/users/friends/:userId", userHandler.HandleDeleteFriend)  //フレンド登録の解除

	r.GET("/groups", groupHandler.HandleGet)                         //所属グループ一覧の取得
	r.GET("/groups/:groupId", groupHandler.HandleGetById)            //グループ情報の取得
	r.POST("/groups", groupHandler.HandleCreate)                     //グループの作成
	r.PUT("/groups/:groupId", groupHandler.HandleUpdate)             //グループ情報の更新
	r.GET("/groups/:groupId/members", groupHandler.HandleGetMembers) //グループに対するメンバー情報の取得
	r.POST("/groups/:groupId/members", groupHandler.HandleRegisterd) //グループに対するメンバーの追加

	r.GET("/groups/:groupId/events", eventHandler.HandleGetById)
	r.GET("/groups/:groupId/events/:eventId", eventHandler.HandleGet)
	r.POST("/groups/:groupId/events", eventHandler.HandleCreate) //イベントの作成
	r.PUT("/groups/:groupId/events/:eventId", eventHandler.HandleUpdate)
	r.DELETE("/groups/:groupId/events/:eventId", eventHandler.HandleDelete)

	r.GET("/payments", paymentHandler.HandleGet)
	r.POST("/payments", paymentHandler.HandleCreate)
	r.GET("/payments/:paymentId", paymentHandler.HandleGetById)
	r.PUT("/payments/:paymentId", paymentHandler.HandleUpdate)
	r.GET("/payments/history", paymentHandler.HandleHistory)

	// サーバーの起動
	go func() {
		if err := r.Start("0.0.0.0:8080"); err != nil && err != http.ErrServerClosed {
			r.Logger.Fatal("shutting down the server")
		}
	}()

	// 割り込みシグナルを待ち、10秒でサーバーをGracefull Shutdownする
	// シグナルの欠落を避けるため、バッファーチャンネルを使用する
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt)
	<-quit
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := r.Shutdown(ctx); err != nil {
		r.Logger.Fatal(err)
	}
}

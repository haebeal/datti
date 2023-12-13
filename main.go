package main

import (
	"log"

	"github.com/gin-gonic/gin"
)

func init() {

}

func main() {
	router := gin.Default()
	router.GET("/api/hello", func(ctx *gin.Context) {
		ctx.String(200, "hello datti")
	})

	if err := router.Run(":8080"); err != nil {
		log.Fatal("Server Run Failed.: ", err)
	}
}

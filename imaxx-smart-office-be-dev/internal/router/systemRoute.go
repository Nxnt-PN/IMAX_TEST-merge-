package router

import (
	"imaxx-smart-office-be/internal/controller"
	"imaxx-smart-office-be/internal/middleware"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func NewSystemRouter(baseRouter *gin.RouterGroup, systemController *controller.SystemController, Db *gorm.DB) {
	systemRouter := baseRouter.Group("/systems")
	systemRouter.Use(middleware.AuthorizeJWT(Db))
	{
		//CRUD
		systemRouter.GET("/", systemController.FindAll)
		systemRouter.GET("/:id", systemController.FindById)
		systemRouter.PUT("/:id", systemController.Update)
	}
}

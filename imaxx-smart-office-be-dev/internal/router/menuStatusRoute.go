package router

import (
	"imaxx-smart-office-be/internal/controller"
	"imaxx-smart-office-be/internal/middleware"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func NewMenuStatusRouter(baseRouter *gin.RouterGroup, menuStatusController *controller.MenuStatusController, Db *gorm.DB) {
	menuStatusRouter := baseRouter.Group("/menu-status")
	menuStatusRouter.Use(middleware.AuthorizeJWT(Db))
	{
		//CRUD
		menuStatusRouter.GET("/my", menuStatusController.GetMyStatus)
	}
}

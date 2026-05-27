package router

import (
	"imaxx-smart-office-be/internal/controller"
	"imaxx-smart-office-be/internal/middleware"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func NewNotificationRouter(baseRouter *gin.RouterGroup, notificationController *controller.NotificationController, Db *gorm.DB) {
	notificationRouter := baseRouter.Group("/notifications")
	notificationRouter.Use(middleware.AuthorizeJWT(Db))
	{
		//CRUD
		notificationRouter.GET("/", notificationController.FindAll)
		notificationRouter.GET("/unread", notificationController.FindUnreadAll)
		notificationRouter.GET("/set-read/:id", notificationController.SetReadById)
		notificationRouter.PATCH("/set-read/all", notificationController.SetReadAll)
	}
}

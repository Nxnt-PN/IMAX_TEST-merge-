package router

import (
	"imaxx-smart-office-be/internal/controller"
	"imaxx-smart-office-be/internal/middleware"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func NewPermissionRouter(baseRouter *gin.RouterGroup, permissionController *controller.PermissionController, Db *gorm.DB) {
	permissionRouter := baseRouter.Group("/permissions")
	permissionRouter.Use(middleware.AuthorizeJWT(Db))
	{
		permissionRouter.GET("/", permissionController.FindAll)
	}
}

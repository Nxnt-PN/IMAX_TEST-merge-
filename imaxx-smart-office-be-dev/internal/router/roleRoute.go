package router

import (
	"imaxx-smart-office-be/internal/controller"
	"imaxx-smart-office-be/internal/middleware"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func NewRoleRouter(baseRouter *gin.RouterGroup, roleController *controller.RoleController, Db *gorm.DB) {
	roleRouter := baseRouter.Group("/roles")
	roleRouter.Use(middleware.AuthorizeJWT(Db))
	{
		//CRUD
		roleRouter.GET("/", roleController.FindAll)
		roleRouter.GET("/active", roleController.FindActiveAll)
		roleRouter.POST("/", roleController.Create)
		roleRouter.GET("/:id", roleController.FindById)
		roleRouter.PUT("/:id", roleController.Update)
		roleRouter.DELETE("/:id", roleController.Delete)
	}
}

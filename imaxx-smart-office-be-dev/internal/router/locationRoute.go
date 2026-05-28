package router

import (
	"imaxx-smart-office-be/internal/controller"
	"imaxx-smart-office-be/internal/middleware"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func NewLocationRouter(baseRouter *gin.RouterGroup, locationController *controller.LocationController, Db *gorm.DB) {
	locationRouter := baseRouter.Group("/locations")
	locationRouter.Use(middleware.AuthorizeJWT(Db))
	{
		locationRouter.GET("/", locationController.FindAll)
		locationRouter.POST("/", locationController.Create)
		locationRouter.PUT("/:id", locationController.Update)
		locationRouter.DELETE("/:id", locationController.Delete)
	}
}

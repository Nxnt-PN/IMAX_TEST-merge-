package router

import (
	"imaxx-smart-office-be/internal/controller"
	"imaxx-smart-office-be/internal/middleware"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func NewLeaveQuotaRouter(baseRouter *gin.RouterGroup, leaveQuotaController *controller.LeaveQuotaController, Db *gorm.DB) {
	leaveQuotaRouter := baseRouter.Group("/leave-quotas")
	leaveQuotaRouter.Use(middleware.AuthorizeJWT(Db))
	{
		//CRUD
		leaveQuotaRouter.GET("/", leaveQuotaController.FindAll)
		leaveQuotaRouter.POST("/", leaveQuotaController.Create)
		leaveQuotaRouter.GET("/:id", leaveQuotaController.FindById)
		leaveQuotaRouter.PUT("/:id", leaveQuotaController.Update)
		leaveQuotaRouter.DELETE("/:id", leaveQuotaController.Delete)
	}
}

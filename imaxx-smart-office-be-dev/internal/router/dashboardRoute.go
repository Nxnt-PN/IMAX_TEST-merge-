package router

import (
	"imaxx-smart-office-be/internal/controller"
	"imaxx-smart-office-be/internal/middleware"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func NewDashboardRouter(baseRouter *gin.RouterGroup, dashboardController *controller.DashboardController, Db *gorm.DB) {
	dashboardRouter := baseRouter.Group("/dashboards")
	dashboardRouter.Use(middleware.AuthorizeJWT(Db))
	{
		//CRUD
		dashboardRouter.GET("/grouping-count", dashboardController.GroupingCount)
		dashboardRouter.GET("/calendar/me", dashboardController.GetMyCalendar)
		dashboardRouter.GET("/calendar/children", dashboardController.GetChildrenCalendar)
	}
}

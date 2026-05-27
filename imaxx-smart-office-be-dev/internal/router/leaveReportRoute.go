package router

import (
	"imaxx-smart-office-be/internal/controller"
	"imaxx-smart-office-be/internal/middleware"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func NewLeaveReportRouter(baseRouter *gin.RouterGroup, leaveReportController *controller.LeaveReportController, Db *gorm.DB) {
	leaveReportRouter := baseRouter.Group("/leave-reports")
	leaveReportRouter.Use(middleware.AuthorizeJWT(Db))
	{
		//CRUD
		leaveReportRouter.GET("/staff", leaveReportController.GetStaffReport)
		leaveReportRouter.GET("/staff/export", leaveReportController.ExportSumReport)
	}
}

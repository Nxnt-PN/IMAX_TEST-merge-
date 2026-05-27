package router

import (
	"imaxx-smart-office-be/internal/controller"
	"imaxx-smart-office-be/internal/middleware"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func NewLeaveFormRouter(baseRouter *gin.RouterGroup, leaveFormController *controller.LeaveFormController, Db *gorm.DB) {
	leaveFormRouter := baseRouter.Group("/leave-forms")
	leaveFormRouter.Use(middleware.AuthorizeJWT(Db))
	{
		//CRUD
		leaveFormRouter.GET("/", leaveFormController.FindAll)
		leaveFormRouter.GET("/me", leaveFormController.FindMyLeaveAll)
		leaveFormRouter.GET("/task", leaveFormController.FindMyTaskAll)
		leaveFormRouter.GET("/report", leaveFormController.FindReportAll)
		leaveFormRouter.GET("/export", leaveFormController.ExportReport)
		leaveFormRouter.GET("/:id", leaveFormController.FindById)
		leaveFormRouter.POST("/", leaveFormController.CreateLeaveForm)
		leaveFormRouter.PUT("/:id", leaveFormController.UpdateLeaveForm)
		leaveFormRouter.DELETE("/:id", leaveFormController.Delete)
		leaveFormRouter.PUT("/review/:id", leaveFormController.ReviewLeaveForm)
		leaveFormRouter.PATCH("/upload/:id", leaveFormController.UploadFile)
		leaveFormRouter.PUT("/cancel/:id", leaveFormController.Cancel)
		// leaveFormRouter.GET("/hols", leaveFormController.GetHols)
	}
}

package router

import (
	"imaxx-smart-office-be/internal/controller"
	"imaxx-smart-office-be/internal/middleware"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func NewWorkflowRouter(baseRouter *gin.RouterGroup, workflowController *controller.WorkflowController, Db *gorm.DB) {
	workflowRouter := baseRouter.Group("/workflows")
	workflowRouter.Use(middleware.AuthorizeJWT(Db))
	{
		//CRUD
		workflowRouter.GET("/", workflowController.FindAll)
		workflowRouter.GET("/active", workflowController.FindActiveAll)
		workflowRouter.POST("/", workflowController.Create)
		workflowRouter.GET("/:id", workflowController.FindById)
		workflowRouter.PUT("/:id", workflowController.Update)
		workflowRouter.DELETE("/:id", workflowController.Delete)
	}
}

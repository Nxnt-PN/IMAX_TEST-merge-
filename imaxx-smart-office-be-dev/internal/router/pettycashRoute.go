package router

import (
	"imaxx-smart-office-be/internal/middleware"
	pettyController "imaxx-smart-office-be/internal/pettycash/controller"
	pettyRepository "imaxx-smart-office-be/internal/pettycash/repository"
	pettyService "imaxx-smart-office-be/internal/pettycash/service"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func NewPettycashRouter(baseRouter *gin.RouterGroup, db *gorm.DB) {
	projectRepo := pettyRepository.NewProjectRepository(db)
	reasonRepo := pettyRepository.NewReasonRepository(db)
	pettyCashRepo := pettyRepository.NewPettyCashRepository(db)

	projectController := pettyController.NewProjectController(pettyService.NewProjectService(projectRepo))
	reasonController := pettyController.NewReasonController(pettyService.NewReasonService(reasonRepo))
	pettyCashController := pettyController.NewPettyCashController(pettyService.NewPettyCashService(pettyCashRepo), db)
	uploadController := pettyController.NewUploadController()

	pettycashRouter := baseRouter.Group("/pettycash")
	pettycashRouter.Use(middleware.AuthorizeJWT(db))
	{
		pettycashRouter.GET("/projects", projectController.GetProjects)
		pettycashRouter.POST("/projects", pettyController.RequirePermission(db, pettyController.PermissionManagePettyCashMaster), projectController.CreateProject)
		pettycashRouter.PUT("/projects/:id", pettyController.RequirePermission(db, pettyController.PermissionManagePettyCashMaster), projectController.UpdateProject)
		pettycashRouter.DELETE("/projects/:id", pettyController.RequirePermission(db, pettyController.PermissionManagePettyCashMaster), projectController.DeleteProject)

		pettycashRouter.GET("/reasons", reasonController.GetReasons)
		pettycashRouter.POST("/reasons", pettyController.RequirePermission(db, pettyController.PermissionManagePettyCashMaster), reasonController.CreateReason)
		pettycashRouter.PUT("/reasons/:id", pettyController.RequirePermission(db, pettyController.PermissionManagePettyCashMaster), reasonController.UpdateReason)
		pettycashRouter.DELETE("/reasons/:id", pettyController.RequirePermission(db, pettyController.PermissionManagePettyCashMaster), reasonController.DeleteReason)

		pettycashRouter.GET("", pettyCashController.GetList)
		pettycashRouter.POST("", pettyCashController.Create)
		pettycashRouter.GET("/summary", pettyCashController.Summary)
		pettycashRouter.POST("/uploads", pettyController.RequirePermission(db, pettyController.PermissionCreatePettyCash, pettyController.PermissionEditPettyCash, pettyController.PermissionSavePettyCash, pettyController.PermissionResendPettyCash), uploadController.UploadFile)
		pettycashRouter.POST("/submit/:id", pettyCashController.Submit)
		pettycashRouter.POST("/approve/:id", pettyCashController.Approve)
		pettycashRouter.POST("/reject/:id", pettyCashController.Reject)
		pettycashRouter.POST("/cancel/:id", pettyCashController.Cancel)
		pettycashRouter.POST("/resend/:id", pettyCashController.Resend)
		pettycashRouter.GET("/:id", pettyCashController.GetByID)
		pettycashRouter.GET("/:id/history", pettyCashController.GetHistory)
		pettycashRouter.GET("/:id/pdf", pettyCashController.DownloadPDF)
		pettycashRouter.PUT("/:id", pettyCashController.Update)
	}
}

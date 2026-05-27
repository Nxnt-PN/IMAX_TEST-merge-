package router

import (
	"imaxx-smart-office-be/internal/controller"
	"imaxx-smart-office-be/internal/middleware"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func NewUserRouter(baseRouter *gin.RouterGroup, userController *controller.UserController, Db *gorm.DB) {
	userRouter := baseRouter.Group("/users")
	userRouter.POST("/authenticate", userController.Authenticate)
	userRouter.Use(middleware.AuthorizeJWT(Db))
	{
		userRouter.POST("/refresh-token", userController.RefreshToken)

		//CRUD
		userRouter.GET("/", userController.FindAll)
		userRouter.GET("/active", userController.FindActiveAll)
		userRouter.POST("/", userController.Create)
		userRouter.GET("/:id", userController.FindById)
		userRouter.PUT("/:id", userController.Update)
		userRouter.PATCH("/me/password", userController.UpdateUserPwd)
		userRouter.DELETE("/:id", userController.Delete)
		userRouter.PATCH("/me/upload-profile", userController.UploadAvatar)
		userRouter.GET("/me", userController.Me)
	}
}

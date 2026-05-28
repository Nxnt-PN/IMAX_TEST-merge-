package main

import (
	"flag"
	"imaxx-smart-office-be/config"
	"imaxx-smart-office-be/internal/controller"
	"imaxx-smart-office-be/internal/middleware"
	"imaxx-smart-office-be/internal/realtime"
	"imaxx-smart-office-be/internal/repository"
	"imaxx-smart-office-be/internal/router"
	"imaxx-smart-office-be/internal/seed"
	"imaxx-smart-office-be/internal/service"
	"log"
	"net/http"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"

	_ "imaxx-smart-office-be/docs" // swagger docs
)

// @title iMaxx Office API
// @version 1.0
// @description iMaxx Office API with Swagger
// @host localhost:5000
// @BasePath /api
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Type 'Bearer ' followed by a space and then your token.
func main() {
	mode := os.Getenv("APP_ENV")
	if mode == "" || mode == "development" {
		errEnv := godotenv.Load()
		if errEnv != nil {
			log.Fatal("Error loading environment")
		}
	}
	db := config.DatabaseConnection()

	//seed data
	seedFlag := flag.String("seed", "f", "include seed data")
	flag.Parse()
	if *seedFlag == "t" {
		seed.SeedUser(db)
		seed.SeedWorkflow(db)
		seed.SeedPettyCash(db)
		seed.SeedLeaveQuota(db)
		return
	}

	// websocket go routine
	realtime.StartDBListener()

	//Initial Repository
	txManager := repository.NewTxManager(db)
	userRepository := repository.NewUserRepositoryImpl(db)
	locationRepository := repository.NewLocationRepositoryImpl(db)
	roleRepository := repository.NewRoleRepositoryImpl(db)
	permissionRepository := repository.NewPermissionRepositoryImpl(db)
	workflowRepository := repository.NewWorkflowRepositoryImpl(db)
	systemRepository := repository.NewSystemRepositoryImpl(db)
	leaveQuotaRepository := repository.NewLeaveQuotaRepositoryImpl(db)
	leaveFormRepository := repository.NewLeaveFormRepositoryImpl(db)
	notificationRepository := repository.NewNotificationRepositoryImpl(db)

	//Initial Service
	userService := service.NewUserServiceImpl(userRepository)
	locationService := service.NewLocationServiceImpl(locationRepository)
	roleService := service.NewRoleServiceImpl(roleRepository)
	permissionService := service.NewPermissionServiceImpl(permissionRepository)
	workflowService := service.NewWorkflowServiceImpl(workflowRepository)
	systemService := service.NewSystemServiceImpl(systemRepository)
	leaveQuotaService := service.NewLeaveQuotaServiceImpl(leaveQuotaRepository)
	leaveFormService := service.NewLeaveFormServiceImpl(
		txManager, leaveFormRepository, leaveQuotaRepository, systemRepository, workflowRepository, userRepository, notificationRepository, roleRepository,
	)
	notificationService := service.NewNotificationServiceImpl(notificationRepository)
	dashboardService := service.NewDashboardServiceImpl(leaveFormRepository, leaveQuotaRepository, userRepository)
	menuStatusService := service.NewMenuStatusServiceImpl(leaveFormRepository, userRepository)
	leaveReportService := service.NewLeaveReportServiceImpl(leaveFormRepository, userRepository)

	//Initial Controller
	userController := controller.NewUserController(userService)
	locationController := controller.NewLocationController(locationService)
	roleController := controller.NewRoleController(roleService)
	permissionController := controller.NewPermissionController(permissionService)
	workflowController := controller.NewWorkflowController(workflowService)
	systemController := controller.NewSystemController(systemService)
	leaveQuotaController := controller.NewLeaveQuotaController(leaveQuotaService)
	leaveFormController := controller.NewLeaveFormController(leaveFormService, userService)
	notificationController := controller.NewNotificationController(notificationService)
	dashboardController := controller.NewDashboardController(dashboardService)
	menuStatusController := controller.NewMenuStatusController(menuStatusService, notificationService)
	leaveReportController := controller.NewLeaveReportController(leaveReportService)

	r := gin.New()
	r.Use(gin.Logger())
	r.Use(middleware.CustomRecovery())
	r.Use(cors.New(cors.Config{
		AllowOrigins:  []string{os.Getenv("APP_BASE_URL")},
		AllowMethods:  []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:  []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders: []string{"Content-Length"},
	}))
	r.Static("/uploads", "./uploads")
	baseRouter := r.Group("/api")
	router.NewUserRouter(baseRouter, userController, db)
	router.NewLocationRouter(baseRouter, locationController, db)
	router.NewRoleRouter(baseRouter, roleController, db)
	router.NewPermissionRouter(baseRouter, permissionController, db)
	router.NewWorkflowRouter(baseRouter, workflowController, db)
	router.NewSystemRouter(baseRouter, systemController, db)
	router.NewLeaveQuotaRouter(baseRouter, leaveQuotaController, db)
	router.NewLeaveFormRouter(baseRouter, leaveFormController, db)
	router.NewNotificationRouter(baseRouter, notificationController, db)
	router.NewDashboardRouter(baseRouter, dashboardController, db)
	router.NewMenuStatusRouter(baseRouter, menuStatusController, db)
	router.NewLeaveReportRouter(baseRouter, leaveReportController, db)

	wsGroup := r.Group("/ws")
	wsGroup.Use(middleware.AuthorizeWS(db))
	{
		wsGroup.GET("", menuStatusController.GetMyStatusWS)
	}

	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status": "ok",
		})
	})
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	port := os.Getenv("PORT")
	server := &http.Server{
		Addr:    ":" + port,
		Handler: r,
	}
	err := server.ListenAndServe()
	if err != nil {
		panic(err)
	}
}

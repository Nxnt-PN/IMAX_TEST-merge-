package controller

import (
	"imaxx-smart-office-be/helper"
	"imaxx-smart-office-be/internal/response"
	"imaxx-smart-office-be/internal/service"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type NotificationController struct {
	notificationService service.NotificationService
}

func NewNotificationController(service service.NotificationService) *NotificationController {
	return &NotificationController{
		notificationService: service,
	}
}

// FindUnreadAll godoc
// @Summary FindUnreadAll notification
// @Description find all unread user notification
// @Tags notifications
// @Accept json
// @Produce json
// @Param page query int false "page number" default(1)
// @Param limit query int false "limit per page number" default(10)
// @Param sort query string false "sort sql string ex. created_at desc" default(created_at desc)
// @Security BearerAuth
// @Success 200 {object} response.DefaultResponse
// @Failure 401 {object} response.DefaultResponse
// @Router /notifications/unread [get]
func (controller *NotificationController) FindUnreadAll(ctx *gin.Context) {
	userID, _ := ctx.MustGet("user_id").(uuid.UUID)
	var pagination helper.Pagination
	ctx.ShouldBindQuery(&pagination)
	if pagination.Page == 0 {
		pagination = pagination.NewPagination("created_at desc")
	}

	resp, err := controller.notificationService.FindUnreadAll(pagination, userID)
	if err != nil {
		// Server Error (500)
		log.Printf("Unexpected Error: %v", err)
		ctx.JSON(http.StatusInternalServerError, response.DefaultResponse{
			Status:  "error",
			Message: "เกิดข้อผิดพลาด",
			Data: gin.H{
				"errors": err.Error(),
			},
		})
		return
	}

	ctx.JSON(http.StatusOK, response.DefaultResponse{
		Status:  "success",
		Message: "เรียกข้อมูลเรียบร้อย",
		Data:    resp,
	})
}

// FindAll godoc
// @Summary FindAll notification
// @Description find all unread user notification
// @Tags notifications
// @Accept json
// @Produce json
// @Param page query int false "page number" default(1)
// @Param limit query int false "limit per page number" default(10)
// @Param sort query string false "sort sql string ex. created_at desc" default(created_at desc)
// @Security BearerAuth
// @Success 200 {object} response.DefaultResponse
// @Failure 401 {object} response.DefaultResponse
// @Router /notifications [get]
func (controller *NotificationController) FindAll(ctx *gin.Context) {
	userID, _ := ctx.MustGet("user_id").(uuid.UUID)
	var pagination helper.Pagination
	ctx.ShouldBindQuery(&pagination)
	if pagination.Page == 0 {
		pagination = pagination.NewPagination("created_at desc")
	}

	resp, err := controller.notificationService.FindAll(pagination, userID)
	if err != nil {
		// Server Error (500)
		log.Printf("Unexpected Error: %v", err)
		ctx.JSON(http.StatusInternalServerError, response.DefaultResponse{
			Status:  "error",
			Message: "เกิดข้อผิดพลาด",
			Data: gin.H{
				"errors": err.Error(),
			},
		})
		return
	}

	ctx.JSON(http.StatusOK, response.DefaultResponse{
		Status:  "success",
		Message: "เรียกข้อมูลเรียบร้อย",
		Data:    resp,
	})
}

// SetReadById godoc
// @Summary SetReadById notification
// @Description Set read status of notification by id
// @Tags notifications
// @Accept json
// @Produce json
// @Param id path string true "Notification ID (uuid)"
// @Security BearerAuth
// @Success 200 {object} response.DefaultResponse
// @Failure 401 {object} response.DefaultResponse
// @Router /notifications/set-read/{id} [get]
func (controller *NotificationController) SetReadById(ctx *gin.Context) {
	paramId := ctx.Param("id")
	editID, errUuid := uuid.Parse(paramId)
	helper.ErrorPanic(errUuid)

	notiData, err := controller.notificationService.SetReadById(ctx.Request.Context(), editID)
	if err != nil {
		if appErr, ok := err.(*helper.AppError); ok {
			ctx.JSON(appErr.StatusCode, response.DefaultResponse{
				Status:  "fail",
				Message: appErr.Message,
			})
			return
		}

		// Server Error (500)
		log.Printf("Unexpected Error: %v", err)
		ctx.JSON(http.StatusInternalServerError, response.DefaultResponse{
			Status:  "error",
			Message: "เกิดข้อผิดพลาด",
			Data: gin.H{
				"errors": err.Error(),
			},
		})
		return
	}
	resp := response.DefaultResponse{
		Status:  "success",
		Message: "เรียกข้อมูลการแจ้งเตือนเรียบร้อย",
		Data:    notiData,
	}

	ctx.JSON(http.StatusOK, resp)

}

// SetReadAll godoc
// @Summary Set Read All notification
// @Description Set read status of notification to all noti
// @Tags notifications
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.DefaultResponse
// @Failure 401 {object} response.DefaultResponse
// @Router /notifications/set-read/all [patch]
func (controller *NotificationController) SetReadAll(ctx *gin.Context) {
	userID, _ := ctx.MustGet("user_id").(uuid.UUID)
	err := controller.notificationService.SetReadAll(ctx.Request.Context(), userID)
	if err != nil {
		if appErr, ok := err.(*helper.AppError); ok {
			ctx.JSON(appErr.StatusCode, response.DefaultResponse{
				Status:  "fail",
				Message: appErr.Message,
			})
			return
		}

		// Server Error (500)
		log.Printf("Unexpected Error: %v", err)
		ctx.JSON(http.StatusInternalServerError, response.DefaultResponse{
			Status:  "error",
			Message: "เกิดข้อผิดพลาด",
			Data: gin.H{
				"errors": err.Error(),
			},
		})
		return
	}
	resp := response.DefaultResponse{
		Status:  "success",
		Message: "อ่านข้อความแจ้งเตือนทั้งหมดแล้ว",
	}

	ctx.JSON(http.StatusOK, resp)

}

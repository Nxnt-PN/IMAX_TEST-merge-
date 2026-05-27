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

type DashboardController struct {
	dashboardService service.DashboardService
}

func NewDashboardController(service service.DashboardService) *DashboardController {
	return &DashboardController{
		dashboardService: service,
	}
}

// GroupingCount godoc
// @Summary GroupingCount day leave
// @Description Grouping Count leave day by leavetype and quota
// @Tags dashboard
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.DefaultResponse
// @Failure 401 {object} response.DefaultResponse
// @Router /dashboards/grouping-count [get]
func (controller *DashboardController) GroupingCount(ctx *gin.Context) {
	userID, _ := ctx.MustGet("user_id").(uuid.UUID)
	resp, err := controller.dashboardService.GroupingCount(userID)
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
	ctx.JSON(http.StatusOK, response.DefaultResponse{
		Status:  "success",
		Message: "เรียกข้อมูลเรียบร้อย",
		Data:    resp,
	})
}

// GetMyCalendar godoc
// @Summary Get My Calendar
// @Description get my leave date to put on calendar
// @Tags dashboard
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.DefaultResponse
// @Failure 401 {object} response.DefaultResponse
// @Router /dashboards/calendar/me [get]
func (controller *DashboardController) GetMyCalendar(ctx *gin.Context) {
	userID, _ := ctx.MustGet("user_id").(uuid.UUID)
	resp, err := controller.dashboardService.GetMyCalendar(userID)
	if err != nil {
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

// GetChildrenCalendar godoc
// @Summary Get My Children Calendar
// @Description get my children leave date to put on calendar
// @Tags dashboard
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.DefaultResponse
// @Failure 401 {object} response.DefaultResponse
// @Router /dashboards/calendar/children [get]
func (controller *DashboardController) GetChildrenCalendar(ctx *gin.Context) {
	userID, _ := ctx.MustGet("user_id").(uuid.UUID)
	resp, err := controller.dashboardService.GetChildrenCalendar(userID)
	if err != nil {
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

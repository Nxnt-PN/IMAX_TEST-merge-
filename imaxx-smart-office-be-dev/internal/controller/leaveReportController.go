package controller

import (
	"errors"
	"imaxx-smart-office-be/helper"
	"imaxx-smart-office-be/internal/response"
	"imaxx-smart-office-be/internal/service"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type LeaveReportController struct {
	leaveReportService service.LeaveReportService
}

func NewLeaveReportController(service service.LeaveReportService) *LeaveReportController {
	return &LeaveReportController{
		leaveReportService: service,
	}
}

// GetStaffReport godoc
// @Summary Get all staff leave report summary
// @Description display staff leave report summary
// @Tags leaveReports
// @Accept json
// @Produce json
// @Param page query int false "page number" default(1)
// @Param limit query int false "limit per page number" default(20)
// @Param sort query string false "sort sql string ex. created_at desc" default(created_at desc)
// @Param keyword query string false "keyword search"
// @Security BearerAuth
// @Success 200 {object} response.DefaultResponse
// @Failure 401 {object} response.DefaultResponse
// @Router /leave-reports/staff [get]
func (controller *LeaveReportController) GetStaffReport(ctx *gin.Context) {
	var paginate helper.Pagination
	ctx.ShouldBindQuery(&paginate)
	if paginate.Page == 0 {
		paginate = paginate.NewPagination("created_at desc")
	}
	// get report
	resp, err := controller.leaveReportService.GetStaffReport(paginate)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			ctx.JSON(http.StatusNotFound, response.DefaultResponse{
				Status:  "fail",
				Message: "ไม่พบข้อมูล",
				Data:    nil,
			})
			return
		}

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

	ctx.Header("Content-Type", "application/json")
	ctx.JSON(http.StatusOK, response.DefaultResponse{
		Status:  "success",
		Message: "เรียกข้อมูลเรียบร้อย",
		Data:    resp,
	})
}

// ExportReport godoc
// @Summary Export staff report to excel
// @Description export staff report to excel
// @Tags leaveReports
// @Accept json
// @Produce json
// @Param page query int false "page number" default(1)
// @Param limit query int false "limit per page number(default 1000)" default(1000)
// @Param sort query string false "sort sql string ex. created_at desc" default(created_at desc)
// @Param keyword query string false "keyword search"
// @Security BearerAuth
// @Success 201 {object} response.DefaultResponse
// @Failure 401 {object} response.DefaultResponse
// @Failure 400 {object} response.DefaultResponse
// @Failure 500 {object} response.DefaultResponse
// @Router /leave-reports/staff/export [get]
func (controller *LeaveReportController) ExportSumReport(ctx *gin.Context) {
	var paginate helper.Pagination
	ctx.ShouldBindQuery(&paginate)
	if paginate.Page == 0 {
		paginate = paginate.NewPagination("created_at desc")
	}
	// get report
	file, err := controller.leaveReportService.ExportStuffReportExcel(paginate)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, response.DefaultResponse{
			Status:  "error",
			Message: err.Error(),
		})
		return
	}

	// file name
	fileName := "stuff_leave_report_" + time.Now().Format("20060102") + ".xlsx"

	ctx.Header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	ctx.Header("Content-Disposition", "attachment; filename="+fileName)
	ctx.Header("Content-Transfer-Encoding", "binary")

	// write file on buffer and send off
	if err := file.Write(ctx.Writer); err != nil {
		ctx.JSON(http.StatusInternalServerError, response.DefaultResponse{
			Status:  "error",
			Message: "ข้อผิดพลาดขณะเขียนไฟล์",
			Data: gin.H{
				"errors": err.Error(),
			},
		})
		return
	}
}

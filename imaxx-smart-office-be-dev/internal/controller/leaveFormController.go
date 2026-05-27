package controller

import (
	"context"
	"errors"
	"imaxx-smart-office-be/helper"
	"imaxx-smart-office-be/internal/model"
	"imaxx-smart-office-be/internal/request"
	"imaxx-smart-office-be/internal/response"
	"imaxx-smart-office-be/internal/service"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type LeaveFormController struct {
	leaveFormService service.LeaveFormService
	userService      service.UserService
}

func NewLeaveFormController(service service.LeaveFormService, userService service.UserService) *LeaveFormController {
	return &LeaveFormController{
		leaveFormService: service,
		userService:      userService,
	}
}

// FindAll godoc
// @Summary FindAll leaveForm
// @Description find all my leave form
// @Tags leaveForms
// @Accept json
// @Produce json
// @Param page query int false "page number" default(1)
// @Param limit query int false "limit per page number" default(10)
// @Param sort query string false "sort sql string ex. created_at desc" default(created_at desc)
// @Param keyword query string false "keyword search(state_detail)"
// @Param leave_type query string false "Leave Type" Enums(absence, annual, sick)
// @Param year       query int    false "Year filter (AD)"
// @Param state      query int    false "State (1=Draft, 2=Waiting, 3=Complete, 4=Rejected)" Enums(1, 2, 3, 4)
// @Security BearerAuth
// @Success 200 {object} response.DefaultResponse
// @Failure 401 {object} response.DefaultResponse
// @Router /leave-forms [get]
func (controller *LeaveFormController) FindAll(ctx *gin.Context) {
	var query request.LeaveFormQuery
	ctx.ShouldBindQuery(&query)
	if query.Pagination.Page == 0 {
		query.Pagination = query.Pagination.NewPagination("created_at desc")
	}

	resp := controller.leaveFormService.FindAll(query)

	ctx.Header("Content-Type", "application/json")
	ctx.JSON(http.StatusOK, response.DefaultResponse{
		Status:  "success",
		Message: "เรียกข้อมูลเรียบร้อย",
		Data:    resp,
	})
}

// FindMyLeaveAll godoc
// @Summary FindMyLeaveAll leaveForm
// @Description find all my leave form
// @Tags leaveForms
// @Accept json
// @Produce json
// @Param page query int false "page number" default(1)
// @Param limit query int false "limit per page number" default(10)
// @Param sort query string false "sort sql string ex. created_at desc" default(created_at desc)
// @Param keyword query string false "keyword search(state_detail)"
// @Param leave_type query string false "Leave Type" Enums(absence, annual, sick)
// @Param year       query int    false "Year filter (AD)"
// @Param state      query int    false "State (1=Draft, 2=Waiting, 3=Complete, 4=Rejected)" Enums(1, 2, 3, 4)
// @Param ids      query string    false "leave form uuids"
// @Security BearerAuth
// @Success 200 {object} response.DefaultResponse
// @Failure 401 {object} response.DefaultResponse
// @Router /leave-forms/me [get]
func (controller *LeaveFormController) FindMyLeaveAll(ctx *gin.Context) {
	userID, _ := ctx.MustGet("user_id").(uuid.UUID)
	var query request.LeaveFormQuery
	ctx.ShouldBindQuery(&query)
	if query.Page == 0 {
		query.Pagination = query.Pagination.NewPagination("created_at desc")
	}

	resp, err := controller.leaveFormService.FindMyLeaveAll(query, &userID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			ctx.JSON(http.StatusNotFound, response.DefaultResponse{
				Status:  "fail",
				Message: "ไม่พบข้อมูล",
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

// FindById godoc
// @Summary FindById leaveForm
// @Description find by id leaveForm
// @Tags leaveForms
// @Accept json
// @Produce json
// @Param id path string true "LeaveForm ID (uuid)"
// @Security BearerAuth
// @Success 200 {object} response.DefaultResponse
// @Failure 401 {object} response.DefaultResponse
// @Router /leave-forms/{id} [get]
func (controller *LeaveFormController) FindById(ctx *gin.Context) {
	paramId := ctx.Param("id")
	editID, errUuid := uuid.Parse(paramId)
	helper.ErrorPanic(errUuid)
	ctx.Header("Content-Type", "application/json")

	lfData, errQuery := controller.leaveFormService.FindById(editID)
	if errQuery != nil {
		ctx.JSON(http.StatusNotFound, response.DefaultResponse{
			Status:  "fail",
			Message: "ไม่พบข้อมูล",
			Data:    nil,
		})
		return
	}
	resp := response.DefaultResponse{
		Status:  "success",
		Message: "เรียกข้อมูลแบบฟอร์มการลาเรียบร้อย",
		Data:    lfData,
	}

	ctx.JSON(http.StatusOK, resp)

}

// CreateLeaveForm godoc
// @Summary CreateLeaveForm leaveform
// @Description create leave form
// @Tags leaveForms
// @Accept json
// @Produce json
// @Param request body request.LeaveFormRequest true "create leave form payload"
// @Security BearerAuth
// @Success 201 {object} response.DefaultResponse
// @Failure 401 {object} response.DefaultResponse
// @Failure 400 {object} response.DefaultResponse
// @Failure 500 {object} response.DefaultResponse
// @Router /leave-forms [post]
func (controller *LeaveFormController) CreateLeaveForm(ctx *gin.Context) {
	req := request.LeaveFormRequest{}
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, response.DefaultResponse{
			Status:  "fail",
			Message: "ค่าที่ส่งมาไม่ถูกต้อง",
			Data: gin.H{
				"errors": err.Error(),
			},
		})
		return
	}

	userID, _ := ctx.MustGet("user_id").(uuid.UUID)

	if req.UserID == nil || !controller.userService.IsAdmin(userID) {
		req.UserID = &userID
	}
	result, err := controller.leaveFormService.CreateLeaveForm(ctx.Request.Context(), req)
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
		Message: "ส่งฟอร์มการลาเรียบร้อย",
		Data:    result,
	}

	ctx.JSON(http.StatusOK, resp)
}

// UpdateLeaveForm godoc
// @Summary Update LeaveForm leaveForm
// @Description update leaveForm save / submit
// @Tags leaveForms
// @Accept json
// @Produce json
// @Param request body request.LeaveFormRequest true "update leaveForm payload"
// @Param id path string true "LeaveForm ID (uuid)"
// @Security BearerAuth
// @Success 200 {object} response.DefaultResponse
// @Failure 401 {object} response.DefaultResponse
// @Router /leave-forms/{id} [put]
func (controller *LeaveFormController) UpdateLeaveForm(ctx *gin.Context) {
	userID, _ := ctx.MustGet("user_id").(uuid.UUID)
	paramId := ctx.Param("id")
	editID, errUuid := uuid.Parse(paramId)
	helper.ErrorPanic(errUuid)

	req := request.LeaveFormRequest{}
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, response.DefaultResponse{
			Status:  "fail",
			Message: "ค่าที่ส่งมาไม่ถูกต้อง",
			Data: gin.H{
				"errors": err.Error(),
			},
		})
		return
	}

	if req.UserID == nil || !controller.userService.IsAdmin(userID) {
		req.UserID = &userID
	}
	result, err := controller.leaveFormService.UpdateLeaveForm(ctx.Request.Context(), editID, req)
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
		Message: "ส่งฟอร์มการลาเรียบร้อย",
		Data:    result,
	}

	ctx.JSON(http.StatusOK, resp)
}

// DeleteLeaveForm godoc
// @Summary DeleteLeaveForm leaveForm
// @Description delete LeaveForm (only state Draft)
// @Tags leaveForms
// @Accept json
// @Produce json
// @Param id path string true "LeaveForm ID (uuid)"
// @Security BearerAuth
// @Success 200 {object} response.DefaultResponse
// @Failure 401 {object} response.DefaultResponse
// @Router /leave-forms/{id} [delete]
func (controller *LeaveFormController) Delete(ctx *gin.Context) {
	userID, _ := ctx.MustGet("user_id").(uuid.UUID)
	paramId := ctx.Param("id")
	deleteID, errUuid := uuid.Parse(paramId)
	helper.ErrorPanic(errUuid)

	err := controller.leaveFormService.Delete(ctx.Request.Context(), deleteID, userID)
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
		Message: "ลบข้อมูลเรียบร้อย",
		Data:    nil,
	}

	ctx.JSON(http.StatusOK, resp)
}

// FindMyTaskAll godoc
// @Summary FindMyTaskAll leaveForm
// @Description find all my task form
// @Tags leaveForms
// @Accept json
// @Produce json
// @Param page query int false "page number" default(1)
// @Param limit query int false "limit per page number" default(10)
// @Param sort query string false "sort sql string ex. created_at desc" default(created_at desc)
// @Param keyword query string false "keyword search"
// @Param leave_type query string false "Leave Type" Enums(absence, annual, sick)
// @Param year       query int    false "Year filter (AD)"
// @Param state      query int    false "State (1=Draft, 2=Waiting, 3=Complete, 4=Rejected)" Enums(1, 2, 3, 4)
// @Param ids        query string    false "leave form task uuids"
// @Security BearerAuth
// @Success 200 {object} response.DefaultResponse
// @Failure 401 {object} response.DefaultResponse
// @Router /leave-forms/task [get]
func (controller *LeaveFormController) FindMyTaskAll(ctx *gin.Context) {
	userID, _ := ctx.MustGet("user_id").(uuid.UUID)
	var query request.LeaveFormQuery
	ctx.ShouldBindQuery(&query)
	if query.Page == 0 {
		query.Pagination = query.Pagination.NewPagination("created_at desc")
	}

	resp, err := controller.leaveFormService.FindMyTaskAll(query, &userID)
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
			Status:  "fail",
			Message: "ไม่พบข้อมูล",
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

// FindReportAll godoc
// @Summary FindReportAll leaveForm
// @Description find all Report
// @Tags leaveForms
// @Accept json
// @Produce json
// @Param page query int false "page number" default(1)
// @Param limit query int false "limit per page number" default(10)
// @Param sort query string false "sort sql string ex. created_at desc" default(created_at desc)
// @Param name query string false "name search"
// @Param keyword query string false "keyword search"
// @Param leave_type query string false "Leave Type" Enums(absence, annual, sick)
// @Param start_date query string false "date filter (start)" format(date)
// @Param end_date   query string false "date filter (end)"   format(date)
// @Security BearerAuth
// @Success 200 {object} response.DefaultResponse
// @Failure 401 {object} response.DefaultResponse
// @Router /leave-forms/report [get]
func (controller *LeaveFormController) FindReportAll(ctx *gin.Context) {
	var query request.LeaveFormQuery
	ctx.ShouldBindQuery(&query)
	if query.Page == 0 {
		query.Pagination = query.Pagination.NewPagination("created_at desc")
	}

	resp := controller.leaveFormService.FindReportAll(query)

	ctx.Header("Content-Type", "application/json")
	ctx.JSON(http.StatusOK, response.DefaultResponse{
		Status:  "success",
		Message: "เรียกข้อมูลเรียบร้อย",
		Data:    resp,
	})
}

// ReviewLeaveForm godoc
// @Summary Review LeaveForm leaveForm
// @Description Review to approve / reject leaveForm
// @Tags leaveForms
// @Accept json
// @Produce json
// @Param id path string true "LeaveForm ID (uuid)"
// @Param request body request.ReviewRequest true "review the leaveform approve and remark"
// @Security BearerAuth
// @Success 200 {object} response.DefaultResponse
// @Failure 401 {object} response.DefaultResponse
// @Router /leave-forms/review/{id} [put]
func (controller *LeaveFormController) ReviewLeaveForm(ctx *gin.Context) {
	userID, _ := ctx.MustGet("user_id").(uuid.UUID)
	reqCtx := context.WithValue(ctx.Request.Context(), "current_user_id", userID)
	paramId := ctx.Param("id")
	editID, errUuid := uuid.Parse(paramId)
	helper.ErrorPanic(errUuid)

	var req request.ReviewRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, response.DefaultResponse{
			Status:  "fail",
			Message: "ค่าที่ส่งมาไม่ถูกต้อง",
			Data: gin.H{
				"errors": err.Error(),
			},
		})
		return
	}

	result, err := controller.leaveFormService.ReviewLeaveForm(reqCtx, req, editID, userID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			ctx.JSON(http.StatusNotFound, response.DefaultResponse{
				Status:  "fail",
				Message: "ไม่พบข้อมูล",
				Data: gin.H{
					"errors": err.Error(),
				},
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

	resp := response.DefaultResponse{
		Status:  "success",
		Message: "อัปเดทสถานะแบบฟอร์มเรียบร้อย",
		Data:    result,
	}

	ctx.JSON(http.StatusOK, resp)
}

// UploadFileLeaveForm godoc
// @Summary UploadFile leaveform
// @Description upload file leave form
// @Tags leaveForms
// @Accept       multipart/form-data
// @Produce      json
// @Param        id    path      string  true  "Leave Form ID"
// @Param        file  formData  file    true  "upload leave form file"
// @Security BearerAuth
// @Success 201 {object} response.DefaultResponse
// @Failure 401 {object} response.DefaultResponse
// @Failure 400 {object} response.DefaultResponse
// @Failure 500 {object} response.DefaultResponse
// @Router /leave-forms/upload/{id} [patch]
func (controller *LeaveFormController) UploadFile(ctx *gin.Context) {
	userID, _ := ctx.MustGet("user_id").(uuid.UUID)
	paramId := ctx.Param("id")
	editID, err := uuid.Parse(paramId)
	// helper.ErrorPanic(errUuid)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, response.DefaultResponse{Status: "fail", Message: "ID ไม่ถูกต้อง"})
		return
	}

	// get file from key "file"
	file, err := ctx.FormFile("file")
	if err != nil {
		ctx.JSON(http.StatusBadRequest, response.DefaultResponse{Status: "fail", Message: "ไม่พบไฟล์"})
		return
	}

	// file path
	uploadPath, oldFilePath, err := controller.leaveFormService.GetFilePath(ctx, userID, editID, file)
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

	// save file in the disk
	if err := ctx.SaveUploadedFile(file, uploadPath); err != nil {
		ctx.JSON(http.StatusInternalServerError, response.DefaultResponse{
			Status:  "error",
			Message: "เกิดข้อผิดพลาด",
			Data: gin.H{
				"errors": err.Error(),
			},
		})
		return
	}

	// remove old file (if has)
	if oldFilePath != "" {
		err = os.Remove(oldFilePath)
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
	}

	// leave form file path save
	updateData := map[string]interface{}{
		model.FieldFilePath: &uploadPath,
	}

	if err := controller.leaveFormService.PatchUpdate(ctx, editID, updateData); err != nil {
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
		Message: "อัปโหลดเรียบร้อย",
	}

	ctx.JSON(http.StatusOK, resp)
}

// CancelLeaveForm godoc
// @Summary CancelLeaveForm leaveForm
// @Description cancel LeaveForm
// @Tags leaveForms
// @Accept json
// @Produce json
// @Param id path string true "LeaveForm ID (uuid)"
// @Param request body request.ReviewRequest true "cancel leave form and put remark"
// @Security BearerAuth
// @Success 200 {object} response.DefaultResponse
// @Failure 401 {object} response.DefaultResponse
// @Router /leave-forms/cancel/{id} [PUT]
func (controller *LeaveFormController) Cancel(ctx *gin.Context) {
	paramId := ctx.Param("id")
	cancelID, errUuid := uuid.Parse(paramId)
	helper.ErrorPanic(errUuid)

	var req request.ReviewRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, response.DefaultResponse{
			Status:  "fail",
			Message: "ค่าที่ส่งมาไม่ถูกต้อง",
			Data: gin.H{
				"errors": err.Error(),
			},
		})
		return
	}

	if err := controller.leaveFormService.Cancel(ctx.Request.Context(), cancelID, req); err != nil {
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

	resp := response.DefaultResponse{
		Status:  "success",
		Message: " Cancel แบบฟอร์มสำเร็จ",
		Data:    nil,
	}

	ctx.JSON(http.StatusOK, resp)
}

// ExportReport godoc
// @Summary Export To Excel leaveform
// @Description export to excel
// @Tags leaveForms
// @Accept json
// @Produce json
// @Param name query string false "name search"
// @Param keyword query string false "keyword search"
// @Param leave_type query string false "Leave Type" Enums(absence, annual, sick)
// @Param start_date query string false "date filter (start)" format(date)
// @Param end_date   query string false "date filter (end)"   format(date)
// @Security BearerAuth
// @Success 201 {object} response.DefaultResponse
// @Failure 401 {object} response.DefaultResponse
// @Failure 400 {object} response.DefaultResponse
// @Failure 500 {object} response.DefaultResponse
// @Router /leave-forms/export [get]
func (controller *LeaveFormController) ExportReport(ctx *gin.Context) {
	var query request.LeaveFormQuery
	ctx.ShouldBindQuery(&query)

	file, err := controller.leaveFormService.ExportReportExcel(query)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, response.DefaultResponse{
			Status:  "error",
			Message: err.Error(),
		})
		return
	}

	// file name
	fileName := "leave_report_" + time.Now().Format("20060102") + ".xlsx"

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

// // ExportReport godoc
// // @Summary Export To Excel leaveform
// // @Description export to excel
// // @Tags leaveForms
// // @Accept json
// // @Produce json
// // @Param page query int false "page number" default(1)
// // @Param limit query int false "limit per page number" default(10)
// // @Param sort query string false "sort sql string ex. created_at desc" default(created_at desc)
// // @Param keyword query string false "keyword search"
// // @Security BearerAuth
// // @Success 201 {object} response.DefaultResponse
// // @Failure 401 {object} response.DefaultResponse
// // @Failure 400 {object} response.DefaultResponse
// // @Failure 500 {object} response.DefaultResponse
// // @Router /leave-forms/staff-report/export [get]
// func (controller *LeaveFormController) ExportSumReport(ctx *gin.Context) {
// 	var query request.LeaveFormQuery
// 	ctx.ShouldBindQuery(&query)

// 	file, err := controller.leaveFormService.ExportReportExcel(query)
// 	if err != nil {
// 		ctx.JSON(http.StatusInternalServerError, response.DefaultResponse{
// 			Status:  "error",
// 			Message: err.Error(),
// 		})
// 		return
// 	}

// 	// file name
// 	fileName := "leave_report_" + time.Now().Format("20060102") + ".xlsx"

// 	ctx.Header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
// 	ctx.Header("Content-Disposition", "attachment; filename="+fileName)
// 	ctx.Header("Content-Transfer-Encoding", "binary")

// 	// write file on buffer and send off
// 	if err := file.Write(ctx.Writer); err != nil {
// 		ctx.JSON(http.StatusInternalServerError, response.DefaultResponse{
// 			Status:  "error",
// 			Message: "ข้อผิดพลาดขณะเขียนไฟล์",
// 			Data: gin.H{
// 				"errors": err.Error(),
// 			},
// 		})
// 		return
// 	}
// }

// // GetFinancialHolidays godoc
// // @Summary get financial institutions’ holidays
// // @Description get json of financial institutions’ holidays
// // @Tags leaveForms
// // @Accept json
// // @Produce json
// // @Security BearerAuth
// // @Success 200 {object} response.DefaultResponse
// // @Failure 500 {object} response.DefaultResponse
// // @Router /leave-forms/get/hols [get]
// func (controller *LeaveFormController) GetHols(ctx *gin.Context) {
// 	url := "https://gateway.api.bot.or.th/financial-institutions-holidays/"

// 	req, _ := http.NewRequest("GET", url, nil)
// 	req.Header.Set("Authorization", "eyJvcmciOiI2NzM1NzgwZWM4YzFlYjAwMDEyYTM3NzEiLCJpZCI6IjNmZWEzZWNlOTgxZjRhMTE5ZmQ2YTY5NzFjMjkzNTAwIiwiaCI6Im11cm11cjEyOCJ9")

// 	client := &http.Client{}
// 	resp, _ := client.Do(req)
// 	defer resp.Body.Close()

// 	body, _ := io.ReadAll(resp.Body)

// 	ctx.Data(http.StatusOK, "application/json", body)
// }

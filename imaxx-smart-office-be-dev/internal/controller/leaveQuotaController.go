package controller

import (
	"imaxx-smart-office-be/helper"
	"imaxx-smart-office-be/internal/request"
	"imaxx-smart-office-be/internal/response"
	"imaxx-smart-office-be/internal/service"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type LeaveQuotaController struct {
	leaveQuotaService service.LeaveQuotaService
}

func NewLeaveQuotaController(service service.LeaveQuotaService) *LeaveQuotaController {
	return &LeaveQuotaController{
		leaveQuotaService: service,
	}
}

// FindAllLeaveQuota godoc
// @Summary FindAllLeaveQuota leaveQuota
// @Description find all leaveQuota
// @Tags leaveQuotas
// @Accept json
// @Produce json
// @Param page query int false "page number" default(1)
// @Param limit query int false "limit per page number" default(10)
// @Param sort query string false "sort sql string ex. created_at desc" default(created_at desc)
// @Param keyword query string false "keyword search"
// @Security BearerAuth
// @Success 200 {object} response.DefaultResponse
// @Failure 401 {object} response.DefaultResponse
// @Router /leave-quotas [get]
func (controller *LeaveQuotaController) FindAll(ctx *gin.Context) {
	var pagination helper.Pagination
	ctx.ShouldBindQuery(&pagination)
	if pagination.Page == 0 {
		pagination = pagination.NewPagination("created_at desc")
	}

	resp := controller.leaveQuotaService.FindAll(pagination)

	ctx.Header("Content-Type", "application/json")
	ctx.JSON(http.StatusOK, response.DefaultResponse{
		Status:  "success",
		Message: "เรียกข้อมูลเรียบร้อย",
		Data:    resp,
	})
}

// FindById godoc
// @Summary FindById leaveQuota
// @Description find by id leaveQuota
// @Tags leaveQuotas
// @Accept json
// @Produce json
// @Param id path string true "LeaveQuota ID (uuid)"
// @Security BearerAuth
// @Success 200 {object} response.DefaultResponse
// @Failure 401 {object} response.DefaultResponse
// @Router /leave-quotas/{id} [get]
func (controller *LeaveQuotaController) FindById(ctx *gin.Context) {
	paramId := ctx.Param("id")
	editID, errUuid := uuid.Parse(paramId)
	helper.ErrorPanic(errUuid)
	ctx.Header("Content-Type", "application/json")

	leaveQuotaData, errQuery := controller.leaveQuotaService.FindById(editID)
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
		Message: "เรียกข้อมูล LeaveQuota เรียบร้อย",
		Data:    leaveQuotaData,
	}

	ctx.JSON(http.StatusOK, resp)

}

// CreateLeaveQuota godoc
// @Summary CreateLeaveQuota leaveQuota
// @Description create leaveQuota
// @Tags leaveQuotas
// @Accept json
// @Produce json
// @Param request body request.CreateLeaveQuotaRequest true "create leaveQuota payload"
// @Security BearerAuth
// @Success 201 {object} response.DefaultResponse
// @Failure 401 {object} response.DefaultResponse
// @Router /leave-quotas [post]
func (controller *LeaveQuotaController) Create(ctx *gin.Context) {
	userID, _ := ctx.MustGet("user_id").(uuid.UUID)
	ctx.Header("Content-Type", "application/json")
	req := request.CreateLeaveQuotaRequest{}
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

	if controller.leaveQuotaService.CheckYearDuplicated(req.Year, &uuid.Nil) {
		ctx.JSON(http.StatusBadRequest, response.DefaultResponse{
			Status:  "fail",
			Message: "ปีดังกล่าวได้ถูกใช้แล้ว",
			Data:    nil,
		})
		return
	}
	now := time.Now()
	req.CreatedBy = &userID
	req.CreatedAt = &now
	created, err := controller.leaveQuotaService.Create(req)

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, response.DefaultResponse{
			Status:  "error",
			Message: "ไม่สามารถสร้าง Leave quota ได้: " + err.Error(),
			Data:    nil,
		})
		return
	}

	resp := response.DefaultResponse{
		Status:  "success",
		Message: "สร้าง Leave quota เรียบร้อย",
		Data:    created,
	}

	ctx.JSON(http.StatusCreated, resp)
}

// UpdateLeaveQuota godoc
// @Summary UpdateLeaveQuota leaveQuota
// @Description update leaveQuota
// @Tags leaveQuotas
// @Accept json
// @Produce json
// @Param request body request.UpdateLeaveQuotaRequest true "update leaveQuota payload"
// @Param id path string true "LeaveQuota ID (uuid)"
// @Security BearerAuth
// @Success 200 {object} response.DefaultResponse
// @Failure 401 {object} response.DefaultResponse
// @Router /leave-quotas/{id} [put]
func (controller *LeaveQuotaController) Update(ctx *gin.Context) {
	userID, _ := ctx.MustGet("user_id").(uuid.UUID)
	paramId := ctx.Param("id")
	editID, errUuid := uuid.Parse(paramId)
	helper.ErrorPanic(errUuid)
	ctx.Header("Content-Type", "application/json")
	req := request.UpdateLeaveQuotaRequest{}
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

	if controller.leaveQuotaService.CheckYearDuplicated(*req.Year, &editID) {
		ctx.JSON(http.StatusBadRequest, response.DefaultResponse{
			Status:  "fail",
			Message: "ปีดังกล่าวได้ถูกใช้แล้ว",
			Data:    nil,
		})
		return
	}

	req.UpdatedBy = &userID
	now := time.Now()
	req.UpdatedAt = &now
	leaveQuotaData, errQuery := controller.leaveQuotaService.Update(editID, req)
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
		Message: "แก้ไข Leave quota เรียบร้อย",
		Data:    leaveQuotaData,
	}

	ctx.JSON(http.StatusOK, resp)
}

// DeleteLeaveQuota godoc
// @Summary DeleteLeaveQuota leaveQuota
// @Description delete leaveQuota
// @Tags leaveQuotas
// @Accept json
// @Produce json
// @Param id path string true "LeaveQuota ID (uuid)"
// @Security BearerAuth
// @Success 200 {object} response.DefaultResponse
// @Failure 401 {object} response.DefaultResponse
// @Router /leave-quotas/{id} [delete]
func (controller *LeaveQuotaController) Delete(ctx *gin.Context) {
	userID, _ := ctx.MustGet("user_id").(uuid.UUID)
	paramId := ctx.Param("id")
	editID, errUuid := uuid.Parse(paramId)
	helper.ErrorPanic(errUuid)
	ctx.Header("Content-Type", "application/json")

	err := controller.leaveQuotaService.Delete(editID, userID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, response.DefaultResponse{
			Status:  "error",
			Message: "ไม่สามารถลบ LeaveQuota ได้: " + err.Error(),
			Data:    nil,
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

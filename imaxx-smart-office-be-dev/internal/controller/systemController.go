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

type SystemController struct {
	systemService service.SystemService
}

func NewSystemController(service service.SystemService) *SystemController {
	return &SystemController{
		systemService: service,
	}
}

// FindAllSystem godoc
// @Summary FindAllSystem system
// @Description find all system
// @Tags systems
// @Accept json
// @Produce json
// @Param page query int false "page number" default(1)
// @Param limit query int false "limit per page number" default(10)
// @Param sort query string false "sort sql string ex. created_at desc" default(created_at desc)
// @Param keyword query string false "keyword search"
// @Security BearerAuth
// @Success 200 {object} response.DefaultResponse
// @Failure 401 {object} response.DefaultResponse
// @Router /systems [get]
func (controller *SystemController) FindAll(ctx *gin.Context) {
	var pagination helper.Pagination
	ctx.ShouldBindQuery(&pagination)
	if pagination.Page == 0 {
		pagination = pagination.NewPagination("created_at desc")
	}

	resp := controller.systemService.FindAll(pagination)

	ctx.Header("Content-Type", "application/json")
	ctx.JSON(http.StatusOK, response.DefaultResponse{
		Status:  "success",
		Message: "เรียกข้อมูลเรียบร้อย",
		Data:    resp,
	})
}

// FindById godoc
// @Summary FindById system
// @Description find by id system
// @Tags systems
// @Accept json
// @Produce json
// @Param id path string true "System ID (uuid)"
// @Security BearerAuth
// @Success 200 {object} response.DefaultResponse
// @Failure 401 {object} response.DefaultResponse
// @Router /systems/{id} [get]
func (controller *SystemController) FindById(ctx *gin.Context) {
	paramId := ctx.Param("id")
	editID, errUuid := uuid.Parse(paramId)
	helper.ErrorPanic(errUuid)
	ctx.Header("Content-Type", "application/json")

	systemData, errQuery := controller.systemService.FindById(editID)
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
		Message: "เรียกข้อมูล System เรียบร้อย",
		Data:    systemData,
	}

	ctx.JSON(http.StatusOK, resp)

}

// UpdateSystem godoc
// @Summary UpdateSystem system
// @Description update system
// @Tags systems
// @Accept json
// @Produce json
// @Param request body request.UpdateSystemRequest true "update system payload"
// @Param id path string true "Role ID (uuid)"
// @Security BearerAuth
// @Success 200 {object} response.DefaultResponse
// @Failure 401 {object} response.DefaultResponse
// @Router /systems/{id} [put]
func (controller *SystemController) Update(ctx *gin.Context) {
	userID, _ := ctx.MustGet("user_id").(uuid.UUID)
	paramId := ctx.Param("id")
	editID, errUuid := uuid.Parse(paramId)
	helper.ErrorPanic(errUuid)
	ctx.Header("Content-Type", "application/json")
	req := request.UpdateSystemRequest{}
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

	// if controller.systemService.CheckNameDuplicated(*req.Name, &editID) {
	// 	ctx.JSON(http.StatusBadRequest, response.DefaultResponse{
	// 		Status:  "fail",
	// 		Message: "ชื่อ System ถูกใช้แล้ว",
	// 		Data:    nil,
	// 	})
	// 	return
	// }

	req.UpdatedBy = &userID
	now := time.Now()
	req.UpdatedAt = &now
	userData, errQuery := controller.systemService.Update(editID, req)
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
		Message: "แก้ไข System เรียบร้อย",
		Data:    userData,
	}

	ctx.JSON(http.StatusOK, resp)
}

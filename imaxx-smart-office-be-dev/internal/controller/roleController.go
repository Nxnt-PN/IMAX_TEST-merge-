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

type RoleController struct {
	roleService service.RoleService
}

func NewRoleController(service service.RoleService) *RoleController {
	return &RoleController{
		roleService: service,
	}
}

// FindAllRole godoc
// @Summary FindAllRole role
// @Description find all role
// @Tags roles
// @Accept json
// @Produce json
// @Param page query int false "page number" default(1)
// @Param limit query int false "limit per page number" default(10)
// @Param sort query string false "sort sql string ex. created_at desc" default(created_at desc)
// @Param keyword query string false "keyword search"
// @Security BearerAuth
// @Success 200 {object} response.DefaultResponse
// @Failure 401 {object} response.DefaultResponse
// @Router /roles [get]
func (controller *RoleController) FindAll(ctx *gin.Context) {
	var pagination helper.Pagination
	ctx.ShouldBindQuery(&pagination)
	if pagination.Page == 0 {
		pagination = pagination.NewPagination("created_at desc")
	}

	resp := controller.roleService.FindAll(pagination)

	ctx.Header("Content-Type", "application/json")
	ctx.JSON(http.StatusOK, response.DefaultResponse{
		Status:  "success",
		Message: "เรียกข้อมูลเรียบร้อย",
		Data:    resp,
	})
}

// FindActiveAllRole godoc
// @Summary FindActiveAllRole role
// @Description find all active role
// @Tags roles
// @Accept json
// @Produce json
// @Param page query int false "page number" default(1)
// @Param limit query int false "limit per page number" default(10)
// @Param sort query string false "sort sql string ex. created_at desc" default(created_at desc)
// @Param keyword query string false "keyword search"
// @Security BearerAuth
// @Success 200 {object} response.DefaultResponse
// @Failure 401 {object} response.DefaultResponse
// @Router /roles/active [get]
func (controller *RoleController) FindActiveAll(ctx *gin.Context) {
	var pagination helper.Pagination
	ctx.ShouldBindQuery(&pagination)
	if pagination.Page == 0 {
		pagination = pagination.NewPagination("created_at desc")
	}

	resp := controller.roleService.FindActiveAll(pagination)

	ctx.Header("Content-Type", "application/json")
	ctx.JSON(http.StatusOK, response.DefaultResponse{
		Status:  "success",
		Message: "เรียกข้อมูลเรียบร้อย",
		Data:    resp,
	})
}

// FindById godoc
// @Summary FindById role
// @Description find by id role
// @Tags roles
// @Accept json
// @Produce json
// @Param id path string true "Role ID (uuid)"
// @Security BearerAuth
// @Success 200 {object} response.DefaultResponse
// @Failure 401 {object} response.DefaultResponse
// @Router /roles/{id} [get]
func (controller *RoleController) FindById(ctx *gin.Context) {
	paramId := ctx.Param("id")
	editID, errUuid := uuid.Parse(paramId)
	helper.ErrorPanic(errUuid)
	ctx.Header("Content-Type", "application/json")

	roleData, errQuery := controller.roleService.FindById(editID)
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
		Message: "เรียกข้อมูล Role เรียบร้อย",
		Data:    roleData,
	}

	ctx.JSON(http.StatusOK, resp)

}

// CreateRole godoc
// @Summary CreateRole role
// @Description create role
// @Tags roles
// @Accept json
// @Produce json
// @Param request body request.CreateRoleRequest true "create role payload"
// @Security BearerAuth
// @Success 201 {object} response.DefaultResponse
// @Failure 401 {object} response.DefaultResponse
// @Router /roles [post]
func (controller *RoleController) Create(ctx *gin.Context) {
	userID, _ := ctx.MustGet("user_id").(uuid.UUID)
	ctx.Header("Content-Type", "application/json")
	req := request.CreateRoleRequest{}
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

	if controller.roleService.CheckNameDuplicated(req.Name, &uuid.Nil) {
		ctx.JSON(http.StatusBadRequest, response.DefaultResponse{
			Status:  "fail",
			Message: "ชื่อ Role ถูกใช้แล้ว",
			Data:    nil,
		})
		return
	}
	now := time.Now()
	req.CreatedBy = &userID
	req.CreatedAt = &now
	created := controller.roleService.Create(req)
	resp := response.DefaultResponse{
		Status:  "success",
		Message: "สร้าง Role เรียบร้อย",
		Data:    created,
	}

	ctx.JSON(http.StatusCreated, resp)
}

// UpdateRole godoc
// @Summary UpdateRole role
// @Description update role
// @Tags roles
// @Accept json
// @Produce json
// @Param request body request.UpdateRoleRequest true "update role payload"
// @Param id path string true "Role ID (uuid)"
// @Security BearerAuth
// @Success 200 {object} response.DefaultResponse
// @Failure 401 {object} response.DefaultResponse
// @Router /roles/{id} [put]
func (controller *RoleController) Update(ctx *gin.Context) {
	userID, _ := ctx.MustGet("user_id").(uuid.UUID)
	paramId := ctx.Param("id")
	editID, errUuid := uuid.Parse(paramId)
	helper.ErrorPanic(errUuid)
	ctx.Header("Content-Type", "application/json")
	req := request.UpdateRoleRequest{}
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

	if controller.roleService.CheckNameDuplicated(*req.Name, &editID) {
		ctx.JSON(http.StatusBadRequest, response.DefaultResponse{
			Status:  "fail",
			Message: "ชื่อ Role ถูกใช้แล้ว",
			Data:    nil,
		})
		return
	}

	req.UpdatedBy = &userID
	now := time.Now()
	req.UpdatedAt = &now
	userData, errQuery := controller.roleService.Update(editID, req)
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
		Message: "แก้ไข Role เรียบร้อย",
		Data:    userData,
	}

	ctx.JSON(http.StatusOK, resp)
}

// RoleUser godoc
// @Summary DeleteRole role
// @Description delete role
// @Tags roles
// @Accept json
// @Produce json
// @Param id path string true "Role ID (uuid)"
// @Security BearerAuth
// @Success 200 {object} response.DefaultResponse
// @Failure 401 {object} response.DefaultResponse
// @Router /roles/{id} [delete]
func (controller *RoleController) Delete(ctx *gin.Context) {
	userID, _ := ctx.MustGet("user_id").(uuid.UUID)
	paramId := ctx.Param("id")
	editID, errUuid := uuid.Parse(paramId)
	helper.ErrorPanic(errUuid)
	ctx.Header("Content-Type", "application/json")

	controller.roleService.Delete(editID, userID)

	resp := response.DefaultResponse{
		Status:  "success",
		Message: "ลบข้อมูลเรียบร้อย",
		Data:    nil,
	}

	ctx.JSON(http.StatusOK, resp)
}

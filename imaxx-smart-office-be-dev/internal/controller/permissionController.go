package controller

import (
	"imaxx-smart-office-be/helper"
	"imaxx-smart-office-be/internal/response"
	"imaxx-smart-office-be/internal/service"
	"net/http"

	"github.com/gin-gonic/gin"
)

type PermissionController struct {
	permissionService service.PermissionService
}

func NewPermissionController(service service.PermissionService) *PermissionController {
	return &PermissionController{
		permissionService: service,
	}
}

// FindAllPermission godoc
// @Summary FindAllPermission permission
// @Description find all permission
// @Tags permissions
// @Accept json
// @Produce json
// @Param page query int false "page number" default(1)
// @Param limit query int false "limit per page number" default(10)
// @Param sort query string false "sort sql string ex. created_at desc" default(created_at desc)
// @Param keyword query string false "keyword search"
// @Security BearerAuth
// @Success 200 {object} response.DefaultResponse
// @Failure 401 {object} response.DefaultResponse
// @Router /permissions [get]
func (controller *PermissionController) FindAll(ctx *gin.Context) {
	var pagination helper.Pagination
	ctx.ShouldBindQuery(&pagination)
	if pagination.Page == 0 {
		pagination = pagination.NewPagination("created_at desc")
	}

	resp := controller.permissionService.FindAll(pagination)

	ctx.Header("Content-Type", "application/json")
	ctx.JSON(http.StatusOK, response.DefaultResponse{
		Status:  "success",
		Message: "เรียกข้อมูลเรียบร้อย",
		Data:    resp,
	})
}

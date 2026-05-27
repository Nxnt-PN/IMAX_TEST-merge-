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

type WorkflowController struct {
	workflowService service.WorkflowService
}

func NewWorkflowController(service service.WorkflowService) *WorkflowController {
	return &WorkflowController{
		workflowService: service,
	}
}

// FindAllWorkflow godoc
// @Summary FindAllWorkflow workflow
// @Description find all workflow
// @Tags workflows
// @Accept json
// @Produce json
// @Param page query int false "page number" default(1)
// @Param limit query int false "limit per page number" default(10)
// @Param sort query string false "sort sql string ex. created_at desc" default(created_at desc)
// @Param keyword query string false "keyword search"
// @Security BearerAuth
// @Success 200 {object} response.DefaultResponse
// @Failure 401 {object} response.DefaultResponse
// @Router /workflows [get]
func (controller *WorkflowController) FindAll(ctx *gin.Context) {
	var pagination helper.Pagination
	ctx.ShouldBindQuery(&pagination)
	if pagination.Page == 0 {
		pagination = pagination.NewPagination("created_at desc")
	}

	resp := controller.workflowService.FindAll(pagination)

	ctx.Header("Content-Type", "application/json")
	ctx.JSON(http.StatusOK, response.DefaultResponse{
		Status:  "success",
		Message: "เรียกข้อมูลเรียบร้อย",
		Data:    resp,
	})
}

// FindActiveAllWorkflow godoc
// @Summary FindActiveAllWorkflow workflow
// @Description find all active workflow
// @Tags workflows
// @Accept json
// @Produce json
// @Param page query int false "page number" default(1)
// @Param limit query int false "limit per page number" default(10)
// @Param sort query string false "sort sql string ex. created_at desc" default(created_at desc)
// @Param keyword query string false "keyword search"
// @Security BearerAuth
// @Success 200 {object} response.DefaultResponse
// @Failure 401 {object} response.DefaultResponse
// @Router /workflows/active [get]
func (controller *WorkflowController) FindActiveAll(ctx *gin.Context) {
	var pagination helper.Pagination
	ctx.ShouldBindQuery(&pagination)
	if pagination.Page == 0 {
		pagination = pagination.NewPagination("created_at desc")
	}

	resp := controller.workflowService.FindActiveAll(pagination)

	ctx.Header("Content-Type", "application/json")
	ctx.JSON(http.StatusOK, response.DefaultResponse{
		Status:  "success",
		Message: "เรียกข้อมูลเรียบร้อย",
		Data:    resp,
	})
}

// FindById godoc
// @Summary FindById workflow
// @Description find by id workflow
// @Tags workflows
// @Accept json
// @Produce json
// @Param id path string true "Workflow ID (uuid)"
// @Security BearerAuth
// @Success 200 {object} response.DefaultResponse
// @Failure 401 {object} response.DefaultResponse
// @Router /workflows/{id} [get]
func (controller *WorkflowController) FindById(ctx *gin.Context) {
	paramId := ctx.Param("id")
	editID, errUuid := uuid.Parse(paramId)
	helper.ErrorPanic(errUuid)
	ctx.Header("Content-Type", "application/json")

	workflowData, errQuery := controller.workflowService.FindById(editID)
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
		Message: "เรียกข้อมูล Workflow เรียบร้อย",
		Data:    workflowData,
	}

	ctx.JSON(http.StatusOK, resp)

}

// CreateWorkflow godoc
// @Summary CreateWorkflow workflow
// @Description create workflow
// @Tags workflows
// @Accept json
// @Produce json
// @Param request body request.CreateWorkflowRequest true "create workflow payload"
// @Security BearerAuth
// @Success 201 {object} response.DefaultResponse
// @Failure 401 {object} response.DefaultResponse
// @Router /workflows [post]
func (controller *WorkflowController) Create(ctx *gin.Context) {
	userID, _ := ctx.MustGet("user_id").(uuid.UUID)
	ctx.Header("Content-Type", "application/json")
	req := request.CreateWorkflowRequest{}
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

	if controller.workflowService.CheckNameDuplicated(req.Name, &uuid.Nil) {
		ctx.JSON(http.StatusBadRequest, response.DefaultResponse{
			Status:  "fail",
			Message: "ชื่อ Workflow ถูกใช้แล้ว",
			Data:    nil,
		})
		return
	}
	now := time.Now()
	req.CreatedBy = &userID
	req.CreatedAt = &now
	created, err := controller.workflowService.Create(req)

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, response.DefaultResponse{
			Status:  "error",
			Message: "ไม่สามารถสร้าง Workflow ได้: " + err.Error(),
			Data:    nil,
		})
		return
	}

	resp := response.DefaultResponse{
		Status:  "success",
		Message: "สร้าง Workflow เรียบร้อย",
		Data:    created,
	}

	ctx.JSON(http.StatusCreated, resp)
}

// UpdateWorkflow godoc
// @Summary UpdateWorkflow workflow
// @Description update workflow
// @Tags workflows
// @Accept json
// @Produce json
// @Param request body request.UpdateWorkflowRequest true "update workflow payload"
// @Param id path string true "Workflow ID (uuid)"
// @Security BearerAuth
// @Success 200 {object} response.DefaultResponse
// @Failure 401 {object} response.DefaultResponse
// @Router /workflows/{id} [put]
func (controller *WorkflowController) Update(ctx *gin.Context) {
	userID, _ := ctx.MustGet("user_id").(uuid.UUID)
	paramId := ctx.Param("id")
	editID, errUuid := uuid.Parse(paramId)
	helper.ErrorPanic(errUuid)
	ctx.Header("Content-Type", "application/json")
	req := request.UpdateWorkflowRequest{}
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

	if controller.workflowService.CheckNameDuplicated(*req.Name, &editID) {
		ctx.JSON(http.StatusBadRequest, response.DefaultResponse{
			Status:  "fail",
			Message: "ชื่อ Workflow ถูกใช้แล้ว",
			Data:    nil,
		})
		return
	}

	req.UpdatedBy = &userID
	now := time.Now()
	req.UpdatedAt = &now
	workflowrData, errQuery := controller.workflowService.Update(editID, req)
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
		Message: "แก้ไข Workflow เรียบร้อย",
		Data:    workflowrData,
	}

	ctx.JSON(http.StatusOK, resp)
}

// DeleteWorkflow godoc
// @Summary DeleteWorkflow workflow
// @Description delete workflow
// @Tags workflows
// @Accept json
// @Produce json
// @Param id path string true "Workflow ID (uuid)"
// @Security BearerAuth
// @Success 200 {object} response.DefaultResponse
// @Failure 401 {object} response.DefaultResponse
// @Router /workflows/{id} [delete]
func (controller *WorkflowController) Delete(ctx *gin.Context) {
	userID, _ := ctx.MustGet("user_id").(uuid.UUID)
	paramId := ctx.Param("id")
	editID, errUuid := uuid.Parse(paramId)
	helper.ErrorPanic(errUuid)
	ctx.Header("Content-Type", "application/json")

	err := controller.workflowService.Delete(editID, userID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, response.DefaultResponse{
			Status:  "error",
			Message: "ไม่สามารถลบ Workflow ได้: " + err.Error(),
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

package controller

import (
	"net/http"

	_ "imaxx-smart-office-be/internal/pettycash/model"
	"imaxx-smart-office-be/internal/pettycash/repository"
	"imaxx-smart-office-be/internal/pettycash/request"
	_ "imaxx-smart-office-be/internal/pettycash/response"
	"imaxx-smart-office-be/internal/pettycash/service"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type ReasonController struct {
	reasonService service.ReasonService
}

func NewReasonController(service service.ReasonService) *ReasonController {
	return &ReasonController{reasonService: service}
}

// GetReasons godoc
// @Summary      Get all reasons
// @Description  ดึงข้อมูลเหตุผลการเบิกทั้งหมดในระบบ
// @Tags         Master Data - Reasons
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        system    query string false "System slug filter, e.g. petty-cash"
// @Param        system_id query string false "System ID filter (UUID)"
// @Success      200  {array}   model.Reason
// @Failure      400  {object}  response.ErrorResponse
// @Failure      500  {object}  response.ErrorResponse
// @Router       /api/reasons [get]
func (c *ReasonController) GetReasons(ctx *gin.Context) {
	filter := repository.ReasonFilter{
		System: ctx.Query("system"),
	}
	if systemIDParam := ctx.Query("system_id"); systemIDParam != "" {
		systemID, err := uuid.Parse(systemIDParam)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid system_id"})
			return
		}
		filter.SystemID = &systemID
	}

	reasons, err := c.reasonService.GetAllReasons(filter)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch reasons"})
		return
	}
	ctx.JSON(http.StatusOK, reasons)
}

// CreateReason godoc
// @Summary      Create reason
// @Description  สร้างข้อมูลเหตุผลการเบิกใหม่
// @Tags         Master Data - Reasons
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        body body      request.ReasonRequest  true  "ข้อมูลเหตุผลที่ต้องการสร้าง"
// @Success      200  {object}  model.Reason
// @Router       /api/reasons [post]
func (c *ReasonController) CreateReason(ctx *gin.Context) {
	var req request.ReasonRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}
	reason, err := c.reasonService.CreateReason(req)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, reason)
}

// UpdateReason godoc
// @Summary      Update reason
// @Description  แก้ไขข้อมูลเหตุผลการเบิก
// @Tags         Master Data - Reasons
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      string                 true  "Reason ID (UUID)"
// @Param        body body      request.ReasonRequest  true  "ข้อมูลเหตุผลที่ต้องการแก้ไข"
// @Success      200  {object}  model.Reason
// @Router       /api/reasons/{id} [put]
func (c *ReasonController) UpdateReason(ctx *gin.Context) {
	id := ctx.Param("id")
	var req request.ReasonRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}
	reason, err := c.reasonService.UpdateReason(id, req)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, reason)
}

// DeleteReason godoc
// @Summary      Delete reason
// @Description  ลบข้อมูลเหตุผลการเบิก
// @Tags         Master Data - Reasons
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      string  true  "Reason ID (UUID)"
// @Success      200  {object}  map[string]interface{}
// @Router       /api/reasons/{id} [delete]
func (c *ReasonController) DeleteReason(ctx *gin.Context) {
	id := ctx.Param("id")
	if err := c.reasonService.DeleteReason(id); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete reason"})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"message": "Reason deleted successfully"})
}

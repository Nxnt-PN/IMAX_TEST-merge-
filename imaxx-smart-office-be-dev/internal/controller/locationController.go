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

type LocationController struct {
	locationService service.LocationService
}

func NewLocationController(service service.LocationService) *LocationController {
	return &LocationController{locationService: service}
}

func (controller *LocationController) FindAll(ctx *gin.Context) {
	var pagination helper.Pagination
	ctx.ShouldBindQuery(&pagination)
	if pagination.Page == 0 {
		pagination = pagination.NewPagination("created_at desc")
	}
	resp := controller.locationService.FindAll(pagination)
	ctx.JSON(http.StatusOK, response.DefaultResponse{Status: "success", Message: "Locations loaded successfully", Data: resp})
}

func (controller *LocationController) Create(ctx *gin.Context) {
	userID, _ := ctx.MustGet("user_id").(uuid.UUID)
	req := request.CreateLocationRequest{}
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, response.DefaultResponse{Status: "fail", Message: "Invalid request body", Data: gin.H{"errors": err.Error()}})
		return
	}
	if controller.locationService.CheckNameDuplicated(req.LocationName, &uuid.Nil) {
		ctx.JSON(http.StatusBadRequest, response.DefaultResponse{Status: "fail", Message: "Location is already in use", Data: nil})
		return
	}
	now := time.Now()
	req.CreatedBy = &userID
	req.CreatedAt = &now
	created := controller.locationService.Create(req)
	ctx.JSON(http.StatusCreated, response.DefaultResponse{Status: "success", Message: "Location created successfully", Data: created})
}

func (controller *LocationController) Update(ctx *gin.Context) {
	userID, _ := ctx.MustGet("user_id").(uuid.UUID)
	editID, errUuid := uuid.Parse(ctx.Param("id"))
	helper.ErrorPanic(errUuid)
	req := request.UpdateLocationRequest{}
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, response.DefaultResponse{Status: "fail", Message: "Invalid request body", Data: gin.H{"errors": err.Error()}})
		return
	}
	if controller.locationService.CheckNameDuplicated(req.LocationName, &editID) {
		ctx.JSON(http.StatusBadRequest, response.DefaultResponse{Status: "fail", Message: "Location is already in use", Data: nil})
		return
	}
	now := time.Now()
	req.UpdatedBy = &userID
	req.UpdatedAt = &now
	data, err := controller.locationService.Update(editID, req)
	if err != nil {
		ctx.JSON(http.StatusNotFound, response.DefaultResponse{Status: "fail", Message: "Location not found", Data: nil})
		return
	}
	ctx.JSON(http.StatusOK, response.DefaultResponse{Status: "success", Message: "Location updated successfully", Data: data})
}

func (controller *LocationController) Delete(ctx *gin.Context) {
	userID, _ := ctx.MustGet("user_id").(uuid.UUID)
	deleteID, errUuid := uuid.Parse(ctx.Param("id"))
	helper.ErrorPanic(errUuid)
	controller.locationService.Delete(deleteID, userID)
	ctx.JSON(http.StatusOK, response.DefaultResponse{Status: "success", Message: "Location deleted successfully", Data: nil})
}

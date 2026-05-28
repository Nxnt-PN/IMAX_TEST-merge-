package controller

import (
	"net/http"

	_ "imaxx-smart-office-be/internal/pettycash/model"
	"imaxx-smart-office-be/internal/pettycash/request"
	"imaxx-smart-office-be/internal/pettycash/service"

	"github.com/gin-gonic/gin"
)

type ProjectController struct {
	projectService service.ProjectService
}

func NewProjectController(service service.ProjectService) *ProjectController {
	return &ProjectController{projectService: service}
}

// GetProjects godoc
// @Summary      Get all projects
// @Description  ดึงข้อมูลโครงการทั้งหมดในระบบ
// @Tags         Master Data - Projects
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Success      200  {array}   model.Project
// @Router       /api/projects [get]
func (c *ProjectController) GetProjects(ctx *gin.Context) {
	projects, err := c.projectService.GetAllProjects()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch projects"})
		return
	}
	ctx.JSON(http.StatusOK, projects)
}

// CreateProject godoc
// @Summary      Create project
// @Description  สร้างโครงการใหม่
// @Tags         Master Data - Projects
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        body body      request.ProjectRequest  true  "ข้อมูลโครงการที่ต้องการสร้าง"
// @Success      200  {object}  model.Project
// @Router       /api/projects [post]
func (c *ProjectController) CreateProject(ctx *gin.Context) {
	var req request.ProjectRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}
	project, err := c.projectService.CreateProject(req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create project"})
		return
	}
	ctx.JSON(http.StatusOK, project)
}

// UpdateProject godoc
// @Summary      Update project
// @Description  แก้ไขข้อมูลโครงการ
// @Tags         Master Data - Projects
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      string                  true  "Project ID (UUID)"
// @Param        body body      request.ProjectRequest  true  "ข้อมูลโครงการที่ต้องการแก้ไข"
// @Success      200  {object}  model.Project
// @Router       /api/projects/{id} [put]
func (c *ProjectController) UpdateProject(ctx *gin.Context) {
	id := ctx.Param("id")
	var req request.ProjectRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}
	project, err := c.projectService.UpdateProject(id, req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update project"})
		return
	}
	ctx.JSON(http.StatusOK, project)
}

// DeleteProject godoc
// @Summary      Delete project
// @Description  ลบข้อมูลโครงการ
// @Tags         Master Data - Projects
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      string  true  "Project ID (UUID)"
// @Success      200  {object}  map[string]interface{}
// @Router       /api/projects/{id} [delete]
func (c *ProjectController) DeleteProject(ctx *gin.Context) {
	id := ctx.Param("id")
	if err := c.projectService.DeleteProject(id); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete project"})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"message": "Project deleted successfully"})
}

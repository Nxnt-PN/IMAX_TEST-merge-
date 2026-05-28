package controller

import (
	"net/http"
	"strconv"

	"imaxx-smart-office-be/internal/pettycash/model"
	"imaxx-smart-office-be/internal/pettycash/repository"
	"imaxx-smart-office-be/internal/pettycash/request"
	"imaxx-smart-office-be/internal/pettycash/response"
	"imaxx-smart-office-be/internal/pettycash/service"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type PettyCashController struct {
	pettyCashService service.PettyCashService
	db               *gorm.DB // ใช้ชั่วคราวเพื่อดึง Roles ของ User
}

func NewPettyCashController(service service.PettyCashService, db *gorm.DB) *PettyCashController {
	return &PettyCashController{pettyCashService: service, db: db}
}

func (c *PettyCashController) buildPettyCashFilter(ctx *gin.Context, user model.User, userID uuid.UUID) repository.PettyCashFilter {
	var roleIDs []any
	for _, r := range user.Roles {
		roleIDs = append(roleIDs, r.ID)
	}

	page, _ := strconv.Atoi(ctx.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(ctx.DefaultQuery("limit", "10"))
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}
	if limit > 100 {
		limit = 100
	}
	requesterID := ctx.Query("user_id")
	if requesterID != "" {
		if _, err := uuid.Parse(requesterID); err != nil {
			requesterID = ""
		}
	}

	return repository.PettyCashFilter{
		SubmitDate:  ctx.Query("submitDate"),
		EndDate:     ctx.Query("endDate"),
		Year:        ctx.Query("year"),
		Status:      ctx.Query("status"),
		Project:     ctx.Query("project"),
		Reason:      ctx.Query("reason"),
		Keyword:     ctx.Query("keyword"),
		View:        ctx.Query("view"),
		RequesterID: requesterID,
		UserID:      userID,
		RoleIDs:     roleIDs,
		Page:        page,
		Limit:       limit,
	}
}

func canViewPettyCashForm(user model.User, form *model.PettyCashForm) bool {
	if form == nil {
		return false
	}
	if userHasPermission(user, PermissionViewPettyCashReport) {
		return true
	}
	if form.UserID == user.ID && userHasPermission(user, PermissionViewPettyCash) {
		return true
	}
	return userHasRoleID(user, form.RoleID) && userHasAnyPermission(user, PermissionApprovePettyCash, PermissionRejectPettyCash)
}

func paginationMeta(page int, limit int, total int64) gin.H {
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}
	totalPages := int64(0)
	if total > 0 {
		totalPages = (total + int64(limit) - 1) / int64(limit)
	}
	return gin.H{
		"page":        page,
		"limit":       limit,
		"total":       total,
		"total_pages": totalPages,
	}
}

// GetList godoc
// @Summary      Get petty cash list
// @Description  Get petty cash forms visible to the current user. Use view=tasks to show approval tasks.
// @Tags         Petty Cash
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        submitDate query string false "Start submit date filter"
// @Param        endDate    query string false "End submit date filter"
// @Param        year       query string false "Year filter"
// @Param        status     query string false "Status filter"
// @Param        project    query string false "Project filter"
// @Param        reason     query string false "Reason filter"
// @Param        keyword    query string false "Keyword filter"
// @Param        view       query string false "View mode. Use tasks for pending approval tasks"
// @Param        user_id    query string false "Requester user ID filter"
// @Param        page       query int    false "Page number" default(1)
// @Param        limit      query int    false "Rows per page. Max 100" default(10)
// @Success      200  {object}  response.PaginatedPettyCashListResponse
// @Failure      401  {object}  response.ErrorResponse
// @Failure      500  {object}  response.ErrorResponse
// @Router       /api/pettycash [get]
func (c *PettyCashController) GetList(ctx *gin.Context) {
	requiredPermissions := []string{PermissionViewPettyCash}
	switch ctx.Query("view") {
	case "all":
		requiredPermissions = []string{PermissionViewPettyCashReport}
	case "tasks":
		requiredPermissions = []string{PermissionApprovePettyCash, PermissionRejectPettyCash}
	}
	user, ok := requirePettyCashPermission(ctx, c.db, requiredPermissions...)
	if !ok {
		return
	}

	filter := c.buildPettyCashFilter(ctx, user, user.ID)

	total, err := c.pettyCashService.CountPettyCashList(filter)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count forms"})
		return
	}

	forms, err := c.pettyCashService.GetPettyCashList(filter)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch forms"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data":       toPettyCashListResponse(forms),
		"pagination": paginationMeta(filter.Page, filter.Limit, total),
	})
}

// GetByID godoc
// @Summary      Get petty cash by ID
// @Description  Get full petty cash form detail by ID.
// @Tags         Petty Cash
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      string  true  "Petty cash form ID (UUID)"
// @Success      200  {object}  model.PettyCashForm
// @Failure      404  {object}  response.ErrorResponse
// @Router       /api/pettycash/{id} [get]
func (c *PettyCashController) GetByID(ctx *gin.Context) {
	id := ctx.Param("id")
	form, err := c.pettyCashService.GetPettyCashByID(id)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	user, ok := currentUserWithRoles(ctx, c.db)
	if !ok {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	if !canViewPettyCashForm(user, form) {
		abortForbidden(ctx)
		return
	}
	ctx.JSON(http.StatusOK, form)
}

// Create godoc
// @Summary      Create petty cash draft
// @Description  Create a new petty cash draft for the current user.
// @Tags         Petty Cash
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        body body      request.CreatePettyCashRequest  true  "Petty cash draft data"
// @Success      200  {object}  response.CreatePettyCashResponse
// @Failure      400  {object}  response.ErrorResponse
// @Failure      500  {object}  response.ErrorResponse
// @Router       /api/pettycash [post]
func (c *PettyCashController) Create(ctx *gin.Context) {
	user, ok := requirePettyCashPermission(ctx, c.db, PermissionCreatePettyCash)
	if !ok {
		return
	}
	var req request.CreatePettyCashRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "ข้อมูลไม่ถูกต้อง"})
		return
	}

	form, err := c.pettyCashService.CreatePettyCash(user.ID, req)
	if err != nil {
		writePettyCashError(ctx, err)
		return
	}

	// ดึงข้อมูลฟอร์มแบบเต็มๆ (ที่ดึงข้อมูล User, Project, Reason มาให้ครบแล้ว) เพื่อส่งกลับไปแสดงผล
	fullForm, _ := c.pettyCashService.GetPettyCashByID(form.ID.String())

	ctx.JSON(http.StatusOK, gin.H{
		"message":      "สร้างฟอร์มสำเร็จ",
		"id":           form.ID,
		"documentNo":   form.DocumentNo,
		"total_amount": form.TotalAmount,
		"data":         fullForm,
	})
}

// Update godoc
// @Summary      Update petty cash draft
// @Description  Update a petty cash draft. Only draft forms can be edited.
// @Tags         Petty Cash
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      string                         true  "Petty cash form ID (UUID)"
// @Param        body body      request.UpdatePettyCashRequest  true  "Petty cash draft data"
// @Success      200  {object}  response.UpdatePettyCashResponse
// @Failure      400  {object}  response.ErrorResponse
// @Failure      500  {object}  response.ErrorResponse
// @Router       /api/pettycash/{id} [put]
func (c *PettyCashController) Update(ctx *gin.Context) {
	user, ok := requirePettyCashPermission(ctx, c.db, PermissionEditPettyCash, PermissionSavePettyCash)
	if !ok {
		return
	}
	id := ctx.Param("id")
	var req request.UpdatePettyCashRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "ข้อมูลไม่ถูกต้อง"})
		return
	}

	form, err := c.pettyCashService.UpdatePettyCash(id, user.ID, req)
	if err != nil {
		writePettyCashError(ctx, err)
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"message": "อัปเดตฟอร์มสำเร็จ", "id": form.ID})
}

// GetHistory godoc
// @Summary      Get petty cash history
// @Description  Get action history for a petty cash form.
// @Tags         Petty Cash
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      string  true  "Petty cash form ID (UUID)"
// @Success      200  {array}   model.PettyCashHistory
// @Failure      500  {object}  response.ErrorResponse
// @Router       /api/pettycash/{id}/history [get]
func (c *PettyCashController) GetHistory(ctx *gin.Context) {
	id := ctx.Param("id")
	form, err := c.pettyCashService.GetPettyCashByID(id)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	user, ok := currentUserWithRoles(ctx, c.db)
	if !ok {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	if !canViewPettyCashForm(user, form) {
		abortForbidden(ctx)
		return
	}
	history, err := c.pettyCashService.GetPettyCashHistory(id)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, history)
}

// Submit godoc
// @Summary      Submit petty cash
// @Description  Submit a draft petty cash form into the approval workflow.
// @Tags         Petty Cash
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      string                         true   "Petty cash form ID (UUID)"
// @Param        body body      request.ActionPettyCashRequest  false  "Submit remark"
// @Success      200  {object}  model.PettyCashForm
// @Failure      500  {object}  response.ErrorResponse
// @Router       /api/pettycash/submit/{id} [post]
func (c *PettyCashController) Submit(ctx *gin.Context) {
	user, ok := requirePettyCashPermission(ctx, c.db, PermissionSubmitPettyCash)
	if !ok {
		return
	}
	id := ctx.Param("id")
	var req request.ActionPettyCashRequest
	ctx.ShouldBindJSON(&req) // ไม่บังคับว่าต้องมี

	form, err := c.pettyCashService.SubmitForm(id, user.ID, req.Remark)
	if err != nil {
		writePettyCashError(ctx, err)
		return
	}
	ctx.JSON(http.StatusOK, form)
}

// Approve godoc
// @Summary      Approve petty cash
// @Description  Approve the current workflow step for a petty cash form.
// @Tags         Petty Cash
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      string                         true   "Petty cash form ID (UUID)"
// @Param        body body      request.ActionPettyCashRequest  false  "Approval remark"
// @Success      200  {object}  response.MessageResponse
// @Failure      500  {object}  response.ErrorResponse
// @Router       /api/pettycash/approve/{id} [post]
func (c *PettyCashController) Approve(ctx *gin.Context) {
	user, ok := requirePettyCashPermission(ctx, c.db, PermissionApprovePettyCash)
	if !ok {
		return
	}
	id := ctx.Param("id")
	var req request.ActionPettyCashRequest
	ctx.ShouldBindJSON(&req)

	if err := c.pettyCashService.ApproveForm(id, user.ID, req.Remark); err != nil {
		writePettyCashError(ctx, err)
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"message": "Form approved successfully"})
}

// Reject godoc
// @Summary      Reject petty cash
// @Description  Reject a petty cash form. The remark field is required.
// @Tags         Petty Cash
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      string                         true  "Petty cash form ID (UUID)"
// @Param        body body      request.RejectPettyCashRequest  true  "Reject remark"
// @Success      200  {object}  response.MessageResponse
// @Failure      400  {object}  response.ErrorResponse
// @Failure      500  {object}  response.ErrorResponse
// @Router       /api/pettycash/reject/{id} [post]
func (c *PettyCashController) Reject(ctx *gin.Context) {
	user, ok := requirePettyCashPermission(ctx, c.db, PermissionRejectPettyCash)
	if !ok {
		return
	}
	id := ctx.Param("id")
	var payload map[string]interface{}
	if err := ctx.ShouldBindJSON(&payload); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "ข้อมูลไม่ถูกต้อง"})
		return
	}

	var remark string
	if r, ok := payload["remark"].(string); ok && r != "" {
		remark = r
	} else if rc, ok := payload["reject_comment"].(string); ok && rc != "" {
		remark = rc
	}

	if remark == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "กรุณาระบุเหตุผลในการปฏิเสธ (remark หรือ reject_comment)"})
		return
	}

	if err := c.pettyCashService.RejectForm(id, user.ID, remark); err != nil {
		writePettyCashError(ctx, err)
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"message": "Form rejected successfully"})
}

// Cancel godoc
// @Summary      Cancel petty cash
// @Description  Cancel a draft or rejected petty cash form. Only the requester can cancel.
// @Tags         Petty Cash
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      string                         true   "Petty cash form ID (UUID)"
// @Param        body body      request.CancelPettyCashRequest  false  "Cancel remark"
// @Success      200  {object}  response.MessageResponse
// @Failure      500  {object}  response.ErrorResponse
// @Router       /api/pettycash/cancel/{id} [post]
func (c *PettyCashController) Cancel(ctx *gin.Context) {
	user, ok := requirePettyCashPermission(ctx, c.db, PermissionCancelPettyCash, PermissionDeletePettyCash, PermissionCreatePettyCash)
	if !ok {
		return
	}
	id := ctx.Param("id")
	var req request.CancelPettyCashRequest
	ctx.ShouldBindJSON(&req)

	if err := c.pettyCashService.CancelForm(id, user.ID, req.Remark); err != nil {
		writePettyCashError(ctx, err)
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"message": "Form cancelled successfully"})
}

// Resend godoc
// @Summary      Resend rejected petty cash
// @Description  Edit and resend a rejected petty cash form back into the approval workflow.
// @Tags         Petty Cash
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      string                         true  "Petty cash form ID (UUID)"
// @Param        body body      request.UpdatePettyCashRequest  true  "Petty cash data to resend"
// @Success      200  {object}  model.PettyCashForm
// @Failure      400  {object}  response.ErrorResponse
// @Failure      500  {object}  response.ErrorResponse
// @Router       /api/pettycash/resend/{id} [post]
func (c *PettyCashController) Resend(ctx *gin.Context) {
	user, ok := requirePettyCashPermission(ctx, c.db, PermissionResendPettyCash)
	if !ok {
		return
	}
	id := ctx.Param("id")
	var req request.UpdatePettyCashRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	form, err := c.pettyCashService.ResendForm(id, user.ID, req)
	if err != nil {
		writePettyCashError(ctx, err)
		return
	}
	ctx.JSON(http.StatusOK, form)
}

// Summary godoc
// @Summary      Get petty cash summary
// @Description  Get simple summary counters and total amount for petty cash forms.
// @Tags         Petty Cash
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        submitDate query string false "Start submit date filter"
// @Param        endDate    query string false "End submit date filter"
// @Param        year       query string false "Year filter"
// @Param        status     query string false "Status filter"
// @Param        project    query string false "Project filter"
// @Param        reason     query string false "Reason filter"
// @Param        keyword    query string false "Keyword filter"
// @Param        view       query string false "View mode. Use all for report view"
// @Param        user_id    query string false "Requester user ID filter"
// @Success      200  {object}  response.PettyCashSummaryResponse
// @Failure      500  {object}  response.ErrorResponse
// @Router       /api/pettycash/summary [get]
func (c *PettyCashController) Summary(ctx *gin.Context) {
	requiredPermissions := []string{PermissionViewPettyCash}
	if ctx.Query("view") == "all" {
		requiredPermissions = []string{PermissionViewPettyCashReport}
	}
	user, ok := requirePettyCashPermission(ctx, c.db, requiredPermissions...)
	if !ok {
		return
	}

	filter := c.buildPettyCashFilter(ctx, user, user.ID)
	filter.Page = 0
	filter.Limit = 0
	forms, err := c.pettyCashService.GetPettyCashList(filter)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var summary response.PettyCashSummaryResponse
	for _, form := range forms {
		summary.TotalRequests++
		summary.TotalAmount += int64(form.TotalAmount)
		switch form.State {
		case 1:
			summary.DraftRequests++
		case 2:
			summary.WaitingRequests++
		case 3:
			summary.CompletedRequests++
		case 4:
			summary.RejectedRequests++
		case 5:
			summary.CancelledRequests++
		}
	}
	ctx.JSON(http.StatusOK, summary)
}

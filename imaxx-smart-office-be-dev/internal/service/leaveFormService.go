package service

import (
	"context"
	"errors"
	"fmt"
	"imaxx-smart-office-be/enums"
	"imaxx-smart-office-be/helper"
	"imaxx-smart-office-be/internal/model"
	"imaxx-smart-office-be/internal/repository"
	"imaxx-smart-office-be/internal/request"
	"imaxx-smart-office-be/mailer"
	"log"
	"mime/multipart"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jinzhu/copier"
	"github.com/xuri/excelize/v2"
	"gorm.io/gorm"
)

type LeaveFormService interface {
	FindAll(query request.LeaveFormQuery) *helper.Pagination
	FindMyLeaveAll(query request.LeaveFormQuery, userId *uuid.UUID) (*helper.Pagination, error)
	FindReportAll(query request.LeaveFormQuery) *helper.Pagination
	FindMyTaskAll(query request.LeaveFormQuery, userID *uuid.UUID) (*helper.Pagination, error)
	FindById(id uuid.UUID) (model.LeaveForm, error)
	CreateLeaveForm(ctx context.Context, req request.LeaveFormRequest) (*model.LeaveForm, error)
	UpdateLeaveForm(ctx context.Context, editID uuid.UUID, req request.LeaveFormRequest) (*model.LeaveForm, error)
	Delete(ctx context.Context, id, userID uuid.UUID) error
	ReviewLeaveForm(ctx context.Context, req request.ReviewRequest, editID, userID uuid.UUID) (*model.LeaveForm, error)
	PatchUpdate(ctx context.Context, editID uuid.UUID, updates map[string]interface{}) error
	GetFilePath(ctx *gin.Context, userID, editID uuid.UUID, file *multipart.FileHeader) (string, string, error)
	Cancel(ctx context.Context, id uuid.UUID, req request.ReviewRequest) error
	ExportReportExcel(query request.LeaveFormQuery) (*excelize.File, error)
}

type LeaveFormServiceImpl struct {
	txManager              repository.TransactionManager
	LeaveFormRepository    repository.LeaveFormRepository
	LeaveQuotaRepository   repository.LeaveQuotaRepository
	SystemRepository       repository.SystemRepository
	WorkflowRepository     repository.WorkflowRepository
	UserRepository         repository.UserRepository
	NotificationRepository repository.NotificationRepository
	Rolerepository         repository.RoleRepository
}

func NewLeaveFormServiceImpl(
	txManager repository.TransactionManager,
	leaveFormRepository repository.LeaveFormRepository,
	leaveQuotaRepository repository.LeaveQuotaRepository,
	systemRepository repository.SystemRepository,
	workflowRepository repository.WorkflowRepository,
	userRepository repository.UserRepository,
	notificationRepository repository.NotificationRepository,
	roleRepository repository.RoleRepository,

) LeaveFormService {
	return &LeaveFormServiceImpl{
		txManager:              txManager,
		LeaveFormRepository:    leaveFormRepository,
		LeaveQuotaRepository:   leaveQuotaRepository,
		SystemRepository:       systemRepository,
		WorkflowRepository:     workflowRepository,
		UserRepository:         userRepository,
		NotificationRepository: notificationRepository,
		Rolerepository:         roleRepository,
	}
}

func (l *LeaveFormServiceImpl) FindAll(query request.LeaveFormQuery) *helper.Pagination {
	// Intent
	criteria := helper.LeaveCriteria{
		Keyword:   query.Keyword,
		LeaveType: query.LeaveType,
		State:     query.State,
	}

	// ส่งให้ Repo
	return l.LeaveFormRepository.FindAll(query.Pagination, criteria)
}

func (l *LeaveFormServiceImpl) FindReportAll(query request.LeaveFormQuery) *helper.Pagination {
	criteria := helper.LeaveCriteria{
		Name:      query.Name,
		LeaveType: query.LeaveType,
		State:     query.State,
		Keyword:   query.Keyword,
	}

	if query.Year != 0 {
		start := time.Date(query.Year, time.January, 1, 0, 0, 0, 0, time.Local)
		criteria.DateRange = []time.Time{start, start.AddDate(1, 0, 0)}
	} else {
		now := time.Now()
		if query.StartDate != nil || query.EndDate != nil {
			criteria.DateRange = helper.DateRangeFinder(query.StartDate, query.EndDate)
		} else {
			criteria.DateRange = helper.YearRange(now.Year(), now.Location())
		}
	}

	return l.LeaveFormRepository.FindAll(query.Pagination, criteria)
}

func (l *LeaveFormServiceImpl) FindMyLeaveAll(query request.LeaveFormQuery, userID *uuid.UUID) (*helper.Pagination, error) {
	// Intent
	criteria := helper.LeaveCriteria{
		UserID:    userID,
		Keyword:   query.Keyword,
		LeaveType: query.LeaveType,
		State:     query.State,
	}

	// Logic
	if query.Year != 0 {
		start := time.Date(query.Year, time.January, 1, 0, 0, 0, 0, time.Local)
		criteria.DateRange = []time.Time{start, start.AddDate(1, 0, 0)}
	} else {
		now := time.Now()
		if query.StartDate != nil || query.EndDate != nil {
			criteria.DateRange = helper.DateRangeFinder(query.StartDate, query.EndDate)
		} else {
			criteria.DateRange = helper.YearRange(now.Year(), now.Location())
		}
	}

	if query.IDs != nil {
		idSlice, err := helper.ParseUUIDs(*query.IDs)
		if err != nil {
			return nil, err
		}
		criteria.IDs = idSlice
	}

	// ส่งให้ Repo
	return l.LeaveFormRepository.FindAll(query.Pagination, criteria), nil
}

func (l *LeaveFormServiceImpl) FindMyTaskAll(query request.LeaveFormQuery, userID *uuid.UUID) (*helper.Pagination, error) {
	roleIDs, err := l.UserRepository.GetUserRoleIDs(*userID)
	if err != nil {
		log.Printf("error finding users: %v", err)
		return nil, helper.NewNotFoundError("ไม่เจอผู้ใช้")
	}

	// Intent
	criteria := helper.LeaveCriteria{
		Keyword:   query.Keyword,
		LeaveType: query.LeaveType,
		State:     query.State,
		RoleIDs:   roleIDs,
	}

	// Logic
	if query.Year != 0 {
		start := time.Date(query.Year, time.January, 1, 0, 0, 0, 0, time.Local)
		criteria.DateRange = []time.Time{start, start.AddDate(1, 0, 0)}
	} else {
		now := time.Now()
		if query.StartDate != nil || query.EndDate != nil {
			criteria.DateRange = helper.DateRangeFinder(query.StartDate, query.EndDate)
		} else {
			criteria.DateRange = helper.YearRange(now.Year(), now.Location())
		}
	}

	if query.IDs != nil {
		idSlice, err := helper.ParseUUIDs(*query.IDs)
		if err != nil {
			return nil, err
		}
		criteria.IDs = idSlice
	}

	return l.LeaveFormRepository.FindAll(query.Pagination, criteria), nil
}

func (l *LeaveFormServiceImpl) FindById(id uuid.UUID) (model.LeaveForm, error) {
	data, err := l.LeaveFormRepository.FindById(id)
	return data, err
}

// CreateLeaveForm - save / submit
func (l *LeaveFormServiceImpl) CreateLeaveForm(ctx context.Context, req request.LeaveFormRequest) (*model.LeaveForm, error) {
	var leaveFormHistory request.LeaveFormHistoryRequest
	var leaveFormCreate model.LeaveForm
	var result *model.LeaveForm

	// business logic validate and normalize time value
	if err := l.leaveDateValidation(req); err != nil {
		return nil, err
	}
	req.TotalDays = l.getBusinessTotalDays(l.normalizeTime(req.StartDate, req.EndDate))
	reqUser, err := l.UserRepository.FindById(*req.UserID)
	if err != nil {
		return nil, err
	}
	switch req.Action {
	// submit case
	case enums.ActionSubmit:
		year := req.StartDate.Year()
		var notifications []model.Notification
		// validate Quota
		if err := l.validateDateAndQuota(*req.UserID, req.LeaveType, req.StartDate, req.EndDate, year, req.TotalDays); err != nil {
			return nil, err
		}

		system, err := l.SystemRepository.FindBySlug(enums.LeaveSystemSlug)
		if err != nil {
			return nil, err
		}
		workflowID := system.WorkflowID

		firstWfDetail, err := l.WorkflowRepository.FindDetailByFilterFirst("workflow_id = ?", []interface{}{workflowID}, "seq ASC")
		if err != nil {
			return nil, err
		}
		roleID := &firstWfDetail.RoleID

		userRoleIDs := make([]uuid.UUID, len(reqUser.Roles))
		for i, role := range reqUser.Roles {
			userRoleIDs[i] = *role.ID
		}

		if helper.Contains(userRoleIDs, *roleID) {
			nextWD, errNext := l.WorkflowRepository.FindDetailByFilterFirst("workflow_id = ? AND seq = ?", []interface{}{workflowID, firstWfDetail.Seq + 1})
			if errNext != nil {
				return nil, errNext
			}
			firstWfDetail = nextWD
			roleID = &firstWfDetail.RoleID
		}

		// set leave form
		req.WorkflowID = &workflowID
		req.RoleID = roleID
		req.StateDetail = firstWfDetail.Name
		req.State = enums.LeaveState(firstWfDetail.State)
		// history
		leaveFormHistory.Action = "SUBMIT"
		leaveFormHistory.State = enums.LeaveState(firstWfDetail.State)
		leaveFormHistory.Remark = req.Remark

		req.LeaveFormHistories = append(req.LeaveFormHistories, leaveFormHistory)
		copier.Copy(&leaveFormCreate, &req)

		// create leaveForm transaction
		err = l.txManager.WithTransaction(ctx, func(txCtx context.Context) error {
			res, err := l.LeaveFormRepository.Create(txCtx, &leaveFormCreate)
			if err != nil {
				return err
			}
			// leaveform
			result = res

			// ถ้า link เหมือนกัน step ต่อไปคือทำเป็นฟังชั่นแยกออกมา
			// find aprrover user ids
			var approvers []helper.UserMailNoti
			err = l.UserRepository.FindUsers(&approvers, helper.UserFilter{RoleID: roleID, ChildUserID: req.UserID})
			if err != nil {
				if _, ok := err.(*helper.AppError); ok {
					return helper.NewNotFoundError("ไม่เจอผู้ Approval")
				}
				return err
			}

			// noti
			fullAppName := reqUser.FirstName + " " + reqUser.LastName
			title := fmt.Sprintf("%s has submitted leave form", fullAppName)

			layout := "2006-01-02 15:04"
			message := fmt.Sprintf("%s submit %s leave on date %s - %s", fullAppName, req.LeaveType, req.StartDate.Format(layout), req.EndDate.Format(layout))

			linkStr := "leave-requests/my-tasks?id=" + result.ID.String()
			for _, approver := range approvers {
				notifications = append(notifications, model.Notification{
					UserID:  *approver.ID,
					Title:   title,
					Message: message,
					Link:    &linkStr,
					IsRead:  0,
				})
			}

			err = l.NotificationRepository.BulkCreate(txCtx, notifications)
			if err != nil {
				return err
			}

			// Goroutine
			go func(emails []helper.UserMailNoti, title, linkStr string) {
				defer func() { recover() }()
				for _, approver := range emails {
					fullname := *approver.FirstName + " " + *approver.LastName
					mailer.SendNotification(*approver.Email, title, fullname, message, linkStr)
				}
			}(approvers, title, linkStr)

			return nil
		})
		// transaction
		return result, err

	// save case
	case enums.ActionSave:
		// set leave form
		req.StateDetail = "Saved draft"
		req.State = enums.StateDraft
		// history
		leaveFormHistory.Action = "DRAFT"
		leaveFormHistory.State = enums.StateDraft
		leaveFormHistory.Remark = req.Remark

		req.LeaveFormHistories = append(req.LeaveFormHistories, leaveFormHistory)
		copier.Copy(&leaveFormCreate, &req)
		result, err := l.LeaveFormRepository.Create(ctx, &leaveFormCreate)
		if err != nil {
			return nil, err
		}

		return result, nil // next step will return with responses.LeaveFormResponse

	default:
		return nil, helper.NewValidationError("Invalid Save / Submit action")
	}
}

// UpdateLeaveForm - save / submit
func (l *LeaveFormServiceImpl) UpdateLeaveForm(ctx context.Context, editID uuid.UUID, req request.LeaveFormRequest) (*model.LeaveForm, error) {
	// id check
	_, err := l.LeaveFormRepository.FindByFilterFirst("id = ? AND user_id = ?", []interface{}{editID, req.UserID})
	if err != nil {
		return nil, helper.NewForbiddenError("ไม่มีสิทธิ์ในการแก้ไขแบบฟอร์มนี้")
	}

	var leaveFormUpdate model.LeaveForm
	var leaveFormHistory request.LeaveFormHistoryRequest
	var result *model.LeaveForm

	// business logic validate and normalize time value
	if err := l.leaveDateValidation(req); err != nil {
		return nil, err
	}
	req.TotalDays = l.getBusinessTotalDays(l.normalizeTime(req.StartDate, req.EndDate))
	reqUser, err := l.UserRepository.FindById(*req.UserID)
	if err != nil {
		return nil, err
	}
	switch req.Action {
	case enums.ActionSubmit:
		var notifications []model.Notification
		year := req.StartDate.Year()

		// validate Quota
		if err := l.validateDateAndQuota(*req.UserID, req.LeaveType, req.StartDate, req.EndDate, year, req.TotalDays); err != nil {
			return nil, err
		}

		system, err := l.SystemRepository.FindBySlug(enums.LeaveSystemSlug)
		if err != nil {
			return nil, err
		}
		workflowID := system.WorkflowID

		firstWfDetail, err := l.WorkflowRepository.FindDetailByFilterFirst("workflow_id = ?", []interface{}{workflowID}, "seq ASC")
		if err != nil {
			return nil, err
		}
		roleID := firstWfDetail.RoleID

		userRoleIDs := make([]uuid.UUID, len(reqUser.Roles))
		for i, role := range reqUser.Roles {
			userRoleIDs[i] = *role.ID
		}

		if helper.Contains(userRoleIDs, roleID) {
			nextWD, errNext := l.WorkflowRepository.FindDetailByFilterFirst("workflow_id = ? AND seq = ?", []interface{}{workflowID, firstWfDetail.Seq + 1})
			if errNext != nil {
				return nil, errNext
			}
			firstWfDetail = nextWD
			roleID = firstWfDetail.RoleID
		}

		// set leaveForm
		req.WorkflowID = &workflowID
		req.RoleID = &roleID
		req.StateDetail = firstWfDetail.Name
		req.State = enums.LeaveState(firstWfDetail.State)
		// history
		leaveFormHistory.Action = "SUBMIT"
		leaveFormHistory.State = enums.LeaveState(firstWfDetail.State)
		leaveFormHistory.Remark = req.Remark

		req.LeaveFormHistories = append(req.LeaveFormHistories, leaveFormHistory)
		// copy to leaveFormUpdate
		copier.Copy(&leaveFormUpdate, &req)

		// update leaveForm transaction
		err = l.txManager.WithTransaction(ctx, func(txCtx context.Context) error {
			res, err := l.LeaveFormRepository.Update(txCtx, editID, &leaveFormUpdate)
			if err != nil {
				return err
			}
			// leaveform
			result = res

			// find approvers
			var approvers []helper.UserMailNoti
			err = l.UserRepository.FindUsers(&approvers, helper.UserFilter{RoleID: &roleID, ChildUserID: req.UserID})
			if err != nil {
				if _, ok := err.(*helper.AppError); ok {
					return helper.NewNotFoundError("ไม่เจอผู้ Approval")
				}
				return err
			}

			// noti
			fullAppName := reqUser.FirstName + " " + reqUser.LastName

			layout := "2006-01-02 15:04"
			message := fmt.Sprintf("%s submit %s leave on date %s - %s", fullAppName, req.LeaveType, req.StartDate.Format(layout), req.EndDate.Format(layout))
			title := fmt.Sprintf("%s has submitted leave form", fullAppName)

			linkStr := "leave-requests/my-tasks?id=" + editID.String()
			for _, aprrover := range approvers {
				notifications = append(notifications, model.Notification{
					UserID:  *aprrover.ID,
					Title:   title,
					Message: message,
					Link:    &linkStr,
					IsRead:  0,
				})
			}

			err = l.NotificationRepository.BulkCreate(txCtx, notifications)
			if err != nil {
				return err
			}

			go func(emails []helper.UserMailNoti, title, linkStr string) {
				defer func() { recover() }()
				for _, approver := range emails {
					fullname := *approver.FirstName + " " + *approver.LastName
					mailer.SendNotification(*approver.Email, title, fullname, message, linkStr)
				}
			}(approvers, title, linkStr)

			return nil
		})

		return result, err

	case enums.ActionSave:
		// set leaveForm
		req.StateDetail = "Updated draft"
		req.WorkflowID = nil
		req.RoleID = nil
		req.State = enums.StateDraft
		// get fields
		selectFields := helper.GetNonEmptyFields(req)
		// history
		leaveFormHistory.State = enums.StateDraft
		leaveFormHistory.Action = "DRAFT"
		leaveFormHistory.Remark = req.Remark

		req.LeaveFormHistories = append(req.LeaveFormHistories, leaveFormHistory)
		// copy to leaveFormUpdate
		copier.Copy(&leaveFormUpdate, &req)
		// update leaveForm
		selectFields = append(selectFields, "WorkflowID", "RoleID", "UpdatedBy")
		result, err := l.LeaveFormRepository.Update(ctx, editID, &leaveFormUpdate, selectFields...)
		if err != nil {
			return nil, err
		}
		return result, nil

	default:
		return nil, helper.NewValidationError("Invalid Save / Submit action")
	}
}

// business logic for time validate
func (l *LeaveFormServiceImpl) leaveDateValidation(r request.LeaveFormRequest) error {
	// pass binding tag check

	// business logic for time validate
	now := time.Now()
	today := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	minAllowedDate := today.AddDate(0, 0, 7)
	retrospectSick := today.AddDate(0, 0, -7)

	if helper.IsWeekend(r.StartDate) || helper.IsWeekend(r.EndDate) {
		return helper.NewValidationError("ไม่สามารถเลือกวันลาตรงกับวันเสาร์-อาทิตย์ได้")
	}

	if !r.EndDate.After(r.StartDate) {
		return helper.NewValidationError("ช่วงเวลาที่เลือกไม่ถูกต้อง (ต้องลาอย่างน้อย 0.5 วัน)")
	}

	// normalize time
	startDate, _ := l.normalizeTime(r.StartDate, r.EndDate)

	switch r.LeaveType {
	case enums.LeaveAnnual:
		if startDate.Before(minAllowedDate) {
			return helper.NewLogicError("ต้องยื่นขอลาพักร้อนล่วงหน้าอย่างน้อย 7 วัน")
		}
	case enums.LeaveSick:
		if startDate.Before(retrospectSick) {
			return helper.NewLogicError("ลาป่วยย้อนหลังได้มากที่สุด 7 วันเท่านั้น")
		}
	default:
		if startDate.Before(now) {
			return helper.NewLogicError("ไม่สามารถลาย้อนหลังได้")
		}
	}

	return nil
}

func (l *LeaveFormServiceImpl) normalizeTime(startDate, endDate time.Time) (time.Time, time.Time) {
	sYear, sMonth, sDay := startDate.Date()
	sHour := startDate.Hour()

	eYear, eMonth, eDay := endDate.Date()
	eHour := endDate.Hour()

	// start
	if sHour < 13 {
		startDate = time.Date(sYear, sMonth, sDay, 0, 0, 0, 0, startDate.Location())
	} else {
		startDate = time.Date(sYear, sMonth, sDay, 12, 0, 0, 0, startDate.Location())
	}

	// end
	if eHour < 1 {
		endDate = time.Date(eYear, eMonth, eDay, 0, 0, 0, 0, endDate.Location())
	} else if eHour <= 13 {
		endDate = time.Date(eYear, eMonth, eDay, 12, 0, 0, 0, endDate.Location())
	} else {
		endDate = time.Date(eYear, eMonth, eDay, 0, 0, 0, 0, endDate.Location()).AddDate(0, 0, 1)
	}
	return startDate, endDate
}

func (l *LeaveFormServiceImpl) getBusinessTotalDays(startDate, endDate time.Time) float64 {
	totalDays := 0.0
	// loop ทีละ 0.5 วัน
	for t := startDate; t.Before(endDate); t = t.Add(12 * time.Hour) {
		// t เป็น weeknd ไหม
		if t.Weekday() != time.Saturday && t.Weekday() != time.Sunday {
			totalDays += 0.5
		}
	}
	return totalDays
}

// Validate date and quota method
func (l *LeaveFormServiceImpl) validateDateAndQuota(userID uuid.UUID, leaveType enums.LeaveType, startDate, endDate time.Time, year int, totalDays float64) error {
	// get user quota this year
	quota, err := l.LeaveQuotaRepository.FindUserLeaveQuota(userID, leaveType, year)
	if err != nil {
		return err
	}

	if quota == 0 {
		return helper.NewLogicError("ไม่พบโควต้าวันลาของผู้ใช้สำหรับปีนี้")
	}

	//leaveDuplicateChk
	_, err = l.LeaveFormRepository.FindByFilterFirst(
		"user_id = ? AND start_date <= ? AND end_date >= ? AND state NOT IN (?)",
		[]interface{}{userID, endDate, startDate, enums.NotCalculateStates()})
	if err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}
	} else {
		return helper.NewLogicError("ไม่สามารถเลือกช่วงเวลาที่คาบเกี่ยวกันกับคำขอลาอื่นๆได้")
	}

	// calculate used days
	usedDays, err := l.LeaveFormRepository.FindUserDaysLeaveCum(userID, string(leaveType), year, enums.StatesForValidateDate())
	if err != nil {
		return err
	}

	// check if exceeds quota
	remaining := quota - usedDays
	if totalDays > remaining {
		return helper.NewLogicError(fmt.Sprintf("วันลาเกินโควต้า (เหลือ %.1f วัน แต่ขอ %.1f วัน) โปรดเลือกวันลาใหม่หรือยกเลิกคำขอลาในอดีต", remaining, totalDays))
	}

	return nil
}

func (l *LeaveFormServiceImpl) Delete(ctx context.Context, id, userID uuid.UUID) error {
	lf, err := l.LeaveFormRepository.FindById(id)
	if err != nil {
		return err
	}
	// id check
	if lf.UserID != userID && !(l.UserRepository.IsAdmin(userID)) {
		return helper.NewForbiddenError("ไม่มีสิทธิ์ในการลบแบบฟอร์มนี้")
	}
	// state check
	if !lf.State.IsDeletableLeaveState() {
		return helper.NewForbiddenError("ไม่สามารถลบแบบฟอร์มการลาในสถานะนี้ได้")
	}
	lf.LeaveFormHistories = nil
	return l.LeaveFormRepository.Delete(ctx, &lf)
}

func (l *LeaveFormServiceImpl) ReviewLeaveForm(ctx context.Context, req request.ReviewRequest, editID, userID uuid.UUID) (*model.LeaveForm, error) {
	var reviewedForm model.LeaveForm
	var selectFields []string
	var notifications []model.Notification
	var result *model.LeaveForm

	user, err := l.UserRepository.FindById(userID)
	if err != nil {
		return nil, err
	}
	roleIDs := make([]uuid.UUID, len(user.Roles))

	for i, role := range user.Roles {
		roleIDs[i] = *role.ID
	}

	// role
	lf, err := l.LeaveFormRepository.FindByFilterFirst("id = ?", []interface{}{editID}, helper.FilterByRoleWithChildren(roleIDs)) // ส่ง scope เข้าไปจัดการ children role
	if err != nil {
		return nil, err
	}

	reqUser, err := l.UserRepository.FindById(lf.UserID)
	if err != nil {
		return nil, err
	}

	workflowID := lf.WorkflowID
	// select workflow detail
	currentWD, err := l.WorkflowRepository.FindDetailByFilterFirst("workflow_id = ? AND role_id = ?", []interface{}{workflowID, lf.RoleID})
	if err != nil {
		return nil, err
	}

	//approve
	var nextWD model.WorkflowDetail
	var roleID uuid.UUID
	isFinal := currentWD.IsFinal
	if currentWD.IsFinal != 1 {
		// not final
		nextWD_, err := l.WorkflowRepository.FindDetailByFilterFirst("workflow_id = ? AND seq = ?", []interface{}{workflowID, currentWD.Seq + 1})
		if err != nil {
			return nil, err
		}
		nextWD = nextWD_
		roleID = nextWD.RoleID

		userRoleIDs := make([]uuid.UUID, len(reqUser.Roles))
		for i, role := range reqUser.Roles {
			userRoleIDs[i] = *role.ID
		}

		if helper.Contains(userRoleIDs, roleID) { //final bypass
			isFinal = nextWD.IsFinal
		}
	}

	if isFinal != 1 {
		reviewedForm = model.LeaveForm{
			WorkflowID:  &nextWD.WorkflowID,
			RoleID:      &roleID,
			State:       enums.LeaveState(nextWD.State),
			StateDetail: nextWD.Name,
			LeaveFormHistories: []model.LeaveFormHistory{
				{
					Action: "APPROVE",
					Remark: req.Remark,
					State:  enums.LeaveState(nextWD.State),
				},
			},
		}
		// get fields
		selectFields = helper.GetNonEmptyFields(reviewedForm)
		selectFields = append(selectFields, "UpdatedBy")

		// find approver user ids
		var approvers []helper.UserMailNoti
		err = l.UserRepository.FindUsers(&approvers, helper.UserFilter{RoleID: &roleID, ChildUserID: &lf.UserID})
		if err != nil {
			if _, ok := err.(*helper.AppError); ok {
				return nil, helper.NewNotFoundError("ไม่เจอผู้ Approval")
			}
			return nil, err
		}

		// find applicant name
		var appName helper.NameOnly
		err = l.UserRepository.FindUser(&appName, helper.UserFilter{ID: &lf.UserID})
		if err != nil {
			return nil, err
		}
		// noti
		fullAppName := *appName.FirstName + " " + *appName.LastName

		layout := "2006-01-02 15:04"
		message := fmt.Sprintf("%s submit %s leave on date %s - %s", fullAppName, lf.LeaveType, lf.StartDate.Format(layout), lf.EndDate.Format(layout))
		title := fmt.Sprintf("%s has submitted leave form", fullAppName)

		linkStr := "leave-requests/my-tasks?id=" + editID.String()
		for _, approver := range approvers {
			notifications = append(notifications, model.Notification{
				UserID:  *approver.ID,
				Title:   title,
				Message: message,
				Link:    &linkStr,
				IsRead:  0,
			})
		}

		go func(emails []helper.UserMailNoti, title, linkStr string) {
			defer func() { recover() }()
			for _, approver := range emails {
				fullname := *approver.FirstName + " " + *approver.LastName
				mailer.SendNotification(*approver.Email, title, fullname, message, linkStr)
			}
		}(approvers, title, linkStr)
	} else {
		// final
		reviewedForm = model.LeaveForm{
			RoleID:      nil,
			State:       enums.StateComplete,
			StateDetail: "Approve",
			LeaveFormHistories: []model.LeaveFormHistory{
				{
					Action: "APPROVE",
					Remark: req.Remark,
					State:  enums.StateComplete,
				},
			},
		}
		// get fields
		selectFields = helper.GetNonEmptyFields(reviewedForm)
		selectFields = append(selectFields, "RoleID", "UpdatedBy")

		// noti
		layout := "2006-01-02 15:04"
		message := fmt.Sprintf("Your leave on date %s - %s has approved", lf.StartDate.Format(layout), lf.EndDate.Format(layout))
		title := "Your Leave has approved"

		linkStr := "leave-requests/my-leaves?id=" + editID.String()
		notifications = append(notifications, model.Notification{
			UserID:  lf.UserID,
			Title:   title,
			Message: message,
			Link:    &linkStr,
			IsRead:  0,
		})

		// email noti
		var appEmail helper.UserMailNoti
		err = l.UserRepository.FindUser(&appEmail, helper.UserFilter{ID: &lf.UserID})
		if err != nil {
			return nil, err
		}

		go func(email helper.UserMailNoti, title, linkStr string) {
			defer func() { recover() }()
			fullname := *appEmail.FirstName + " " + *appEmail.LastName
			mailer.SendNotification(*appEmail.Email, title, fullname, message, linkStr)

		}(appEmail, title, linkStr)
	}

	// transaction
	err = l.txManager.WithTransaction(ctx, func(txCtx context.Context) error {
		// lf update
		res, err := l.LeaveFormRepository.Update(txCtx, editID, &reviewedForm, selectFields...)
		if err != nil {
			return err
		}
		result = res
		// noti
		if len(notifications) != 0 {
			err := l.NotificationRepository.BulkCreate(txCtx, notifications)
			if err != nil {
				return err
			}
		}
		return nil
	})
	if err != nil {
		return nil, err
	}
	return result, nil
}

func (l *LeaveFormServiceImpl) PatchUpdate(ctx context.Context, id uuid.UUID, updates map[string]interface{}) error {
	return l.LeaveFormRepository.MagicUpdate(ctx, id, updates, nil)
}

func (l *LeaveFormServiceImpl) GetFilePath(ctx *gin.Context, userID, editID uuid.UUID, file *multipart.FileHeader) (string, string, error) {
	// find id
	lf, err := l.LeaveFormRepository.FindById(editID)
	if err != nil {
		return "", "", helper.NewNotFoundError("ไม่พบข้อมูล: " + err.Error())
	}

	// admin can upload to all user
	if userID != lf.UserID && !l.UserRepository.IsAdmin(userID) {
		return "", "", helper.NewForbiddenError("ไม่มีสิทธิ์ในการอัปโหลดไฟล์ในแบบฟอร์มนี้")
	}

	// file validate
	// if err := helper.FileValidation(file); err != nil {
	// 	return "", "", err
	// }

	// file dest
	uploadPath := fmt.Sprintf("uploads/leaves/%s/%s", editID, file.Filename)

	//old file path (if has)
	var oldFilePath string
	if lf.FilePath != nil && *lf.FilePath != uploadPath {
		oldFilePath = *lf.FilePath
	}
	return uploadPath, oldFilePath, nil
}

func (l *LeaveFormServiceImpl) Cancel(ctx context.Context, id uuid.UUID, req request.ReviewRequest) error {
	var canceller string
	// get lf
	lf, err := l.LeaveFormRepository.FindByFilterFirst("id = ?", []interface{}{id})
	if err != nil {
		return err
	}

	if lf.State.IsCancellableLeaveState() == false {
		return helper.NewLogicError("The state of leaveform is un-calcellable")
	}

	// chk user
	userID, err := helper.GetUserIDFromCtx(ctx)
	if err != nil {
		return err
	}

	// check who cancel
	if lf.State.IsStateNotApproveByFirst() && (lf.UserID == *userID) {
		canceller = "User"
	} else {
		// find and check for approver
		user, err := l.UserRepository.FindById(*userID)
		if err != nil {
			return err
		}
		roleIDs := make([]uuid.UUID, len(user.Roles))

		for i, role := range user.Roles {
			roleIDs[i] = *role.ID
		}

		wfDetails, err := l.WorkflowRepository.FindDetailByFilterFirst("workflow_id = ? AND role_id IN (?)", []interface{}{lf.WorkflowID, roleIDs}, "seq DESC")
		if err != nil {
			return err
		}
		roleID := wfDetails.RoleID
		// aprrover check
		var approver helper.NameOnly
		err = l.UserRepository.FindUser(&approver, helper.UserFilter{ID: userID, RoleID: &roleID})
		if err != nil {
			return helper.NewForbiddenError("ไม่มีสิทธิ์ในการ cancel แบบฟอร์มนี้")
		}
		// get role name
		role, result := l.Rolerepository.FindById(roleID)
		if result.Error != nil {
			return result.Error
		}
		canceller = role.Name
	}

	updateData := map[string]interface{}{
		model.FieldWorkflowID:  nil,
		model.FieldRoleID:      nil,
		model.FieldState:       enums.StateCancelled,
		model.FieldStateDetail: "Cancelled by " + canceller,
	}
	history := model.LeaveFormHistory{
		LeaveFormID: id,
		Action:      "CANCEL",
		Remark:      req.Remark,
		State:       enums.StateCancelled,
	}

	return l.LeaveFormRepository.MagicUpdate(ctx, id, updateData, &history)
}

func (l *LeaveFormServiceImpl) ExportReportExcel(query request.LeaveFormQuery) (*excelize.File, error) {
	// report filter
	criteria := helper.LeaveCriteria{
		Name:      query.Name,
		LeaveType: query.LeaveType,
		State:     query.State,
	}

	if query.StartDate != nil && query.EndDate != nil {
		y, m, d := query.EndDate.Date()
		endOfDay := time.Date(y, m, d, 23, 59, 59, 0, query.EndDate.Location())
		criteria.DateRange = []time.Time{*query.StartDate, endOfDay}
	}

	pagination := helper.Pagination{
		Limit: -1,
	}

	// repo
	rawReports := l.LeaveFormRepository.FindAll(pagination, criteria)

	f := excelize.NewFile()
	sheet := "Sheet1"
	// f.SetSheetName("Sheet1", sheet)

	// สร้าง Header
	headers := []string{"ชื่อ-นามสกุล", "ประเภทการลา", "วันที่เริ่ม", "วันที่สิ้นสุด", "เหตุผล", "สถานะ"}
	for i, h := range headers {
		cell, _ := excelize.CoordinatesToCellName(i+1, 1)
		f.SetCellValue(sheet, cell, h)
	}

	reports, ok := rawReports.Rows.([]model.LeaveForm)
	if !ok {
		return nil, fmt.Errorf("invalid data type: expected []model.LeaveForm")
	}

	// ใส่ข้อมูล
	for i, row := range reports {
		f.SetCellValue(sheet, fmt.Sprintf("A%d", i+2), row.User.FirstName+" "+row.User.LastName)
		f.SetCellValue(sheet, fmt.Sprintf("B%d", i+2), row.LeaveType)
		f.SetCellValue(sheet, fmt.Sprintf("C%d", i+2), row.StartDate.Format("2006-01-02 15:04:05"))
		f.SetCellValue(sheet, fmt.Sprintf("D%d", i+2), row.EndDate.Format("2006-01-02 15:04:05"))
		reason := ""
		if row.Reason != nil {
			reason = *row.Reason
		}
		f.SetCellValue(sheet, fmt.Sprintf("E%d", i+2), reason)
		f.SetCellValue(sheet, fmt.Sprintf("F%d", i+2), row.State.String())
	}

	return f, nil
}

package service

import (
	"errors"
	"fmt"
	"time"

	"imaxx-smart-office-be/internal/pettycash/model"
	"imaxx-smart-office-be/internal/pettycash/request"

	"github.com/google/uuid"
)

func (s *pettyCashServiceImpl) SubmitForm(id string, userID uuid.UUID, remark string) (*model.PettyCashForm, error) {
	formUUID, err := uuid.Parse(id)
	if err != nil {
		return nil, errors.New("invalid form id")
	}

	form, err := s.repo.FindByID(formUUID)
	if err != nil {
		return nil, err
	}

	if form.State != 1 {
		return nil, errors.New("form is not in draft state")
	}
	if form.UserID != userID {
		return nil, errors.New("only requester can submit this form")
	}
	if err := validateFormReadyToSubmit(form); err != nil {
		return nil, err
	}

	workflowDetails, err := s.repo.FindWorkflowDetails(form.WorkflowID)
	if err != nil || len(workflowDetails) == 0 {
		return nil, errors.New("workflow details not found")
	}

	form.State = 2

	history := &model.PettyCashHistory{
		PettyCashFormID: form.ID,
		UserID:          &userID,
		Action:          "Submitted",
		State:           form.State,
		Remark:          remark,
		CreatedAt:       time.Now().UTC(),
	}
	s.repo.SaveHistory(history)

	// ดึง Role ทั้งหมดของคนสร้างมาเก็บไว้ตรวจสอบ
	userRoles := make(map[uuid.UUID]bool)
	if form.User != nil {
		for _, r := range form.User.Roles {
			userRoles[r.ID] = true
		}
	}

	// วนลูปเพื่อเช็คและข้ามขั้นตอนที่ตัวเองมีสิทธิ์อนุมัติ
	stepIndex := 0
	for stepIndex < len(workflowDetails) {
		currentStep := workflowDetails[stepIndex]

		if userRoles[currentStep.RoleID] {
			autoRemark := fmt.Sprintf("Auto-approved (Requester has %s role)", currentStep.Role.Name)
			if currentStep.IsFinal == 1 {
				form.State = 3
				form.StateDetail = "Completed"
				s.repo.SaveHistory(&model.PettyCashHistory{
					PettyCashFormID: form.ID,
					UserID:          &userID,
					Action:          "Approved",
					State:           form.State,
					Remark:          autoRemark,
					CreatedAt:       time.Now().UTC(),
				})
				break
			} else {
				s.repo.SaveHistory(&model.PettyCashHistory{
					PettyCashFormID: form.ID,
					UserID:          &userID,
					Action:          "Approved",
					State:           form.State,
					Remark:          autoRemark,
					CreatedAt:       time.Now().UTC(),
				})
				stepIndex++
			}
		} else {
			form.RoleID = currentStep.RoleID
			form.StateDetail = getStateString(currentStep.State)
			break
		}
	}

	if stepIndex == len(workflowDetails) && form.State != 3 {
		form.State = 3
		form.StateDetail = "Completed"
	}

	form.UpdatedAt = time.Now().UTC()

	if err := s.repo.Update(form); err != nil {
		return nil, err
	}
	s.notifyPendingApprovers(form, "New petty cash request", fmt.Sprintf("%s is waiting for your approval", form.Title))
	if form.State == 3 {
		s.notifyRequester(form, "Petty cash completed", fmt.Sprintf("%s has been completed", form.Title))
	}

	return form, nil
}

func validateFormReadyToSubmit(form *model.PettyCashForm) error {
	if form.Title == "" {
		return errors.New("title is required")
	}
	if len(form.Items) == 0 {
		return errors.New("petty cash items are required")
	}
	for _, item := range form.Items {
		if item.ProjectID == uuid.Nil || item.ReasonID == uuid.Nil || item.Description == "" || item.Total <= 0 {
			return errors.New("petty cash item details are required")
		}
	}
	return nil
}

func (s *pettyCashServiceImpl) ApproveForm(id string, approverID uuid.UUID, remark string) error {
	formUUID, err := uuid.Parse(id)
	if err != nil {
		return errors.New("invalid form id")
	}

	form, err := s.repo.FindByID(formUUID)
	if err != nil {
		return err
	}

	if form.State != 2 {
		return errors.New("form is not pending approval")
	}
	if form.RoleID == uuid.Nil {
		return errors.New("form has no pending approval role")
	}
	if ok, err := s.repo.UserHasRole(approverID, form.RoleID); err != nil || !ok {
		return errors.New("approver does not have the current approval role")
	}

	workflowDetails, err := s.repo.FindWorkflowDetails(form.WorkflowID)
	if err != nil {
		return err
	}

	currentIndex := -1
	for index, detail := range workflowDetails {
		if detail.RoleID == form.RoleID {
			currentIndex = index
			break
		}
	}
	if currentIndex == -1 {
		return errors.New("current workflow step not found")
	}

	currentStep := workflowDetails[currentIndex]
	form.State = 2
	if currentStep.IsFinal == 1 {
		form.State = 3
		form.StateDetail = "Completed"
	}

	history := &model.PettyCashHistory{
		PettyCashFormID: form.ID,
		UserID:          &approverID,
		Action:          "Approved",
		State:           form.State,
		Remark:          remark,
		CreatedAt:       time.Now().UTC(),
	}
	s.repo.SaveHistory(history)

	if form.State != 3 {
		userRoles := make(map[uuid.UUID]bool)
		if form.User != nil {
			for _, r := range form.User.Roles {
				userRoles[r.ID] = true
			}
		}

		stepIndex := currentIndex + 1
		for stepIndex < len(workflowDetails) {
			nextStep := workflowDetails[stepIndex]

			if userRoles[nextStep.RoleID] {
				autoRemark := fmt.Sprintf("Auto-approved (Requester has %s role)", nextStep.Role.Name)
				if nextStep.IsFinal == 1 {
					form.State = 3
					form.StateDetail = "Completed"
					s.repo.SaveHistory(&model.PettyCashHistory{
						PettyCashFormID: form.ID,
						UserID:          &form.UserID, // ใช้ ID ของคนตั้งเรื่อง
						Action:          "Approved",
						State:           form.State,
						Remark:          autoRemark,
						CreatedAt:       time.Now().UTC(),
					})
					break
				} else {
					s.repo.SaveHistory(&model.PettyCashHistory{
						PettyCashFormID: form.ID,
						UserID:          &form.UserID, // ใช้ ID ของคนตั้งเรื่อง
						Action:          "Approved",
						State:           form.State,
						Remark:          autoRemark,
						CreatedAt:       time.Now().UTC(),
					})
					stepIndex++
				}
			} else {
				form.RoleID = nextStep.RoleID
				form.StateDetail = getStateString(nextStep.State)
				break
			}
		}

		if stepIndex == len(workflowDetails) && form.State != 3 {
			form.State = 3
			form.StateDetail = "Completed"
		}
	}

	form.UpdatedAt = time.Now().UTC()

	if err := s.repo.Update(form); err != nil {
		return err
	}
	if form.State == 3 {
		s.notifyRequester(form, "Petty cash completed", fmt.Sprintf("%s has been approved and completed", form.Title))
	} else {
		s.notifyPendingApprovers(form, "Petty cash approval pending", fmt.Sprintf("%s is waiting for your approval", form.Title))
	}

	return nil
}

func getStateString(state int) string {
	switch state {
	case 2:
		return "Waiting Manager Approval"
	case 3:
		return "Waiting HR Approval"
	case 4:
		return "Waiting Finance Approval"
	default:
		return "Waiting"
	}
}

func (s *pettyCashServiceImpl) RejectForm(id string, approverID uuid.UUID, remark string) error {
	formUUID, err := uuid.Parse(id)
	if err != nil {
		return errors.New("invalid form id")
	}

	form, err := s.repo.FindByID(formUUID)
	if err != nil {
		return err
	}
	if form.State != 2 {
		return errors.New("form is not pending approval")
	}
	if form.RoleID == uuid.Nil {
		return errors.New("form has no pending approval role")
	}
	if ok, err := s.repo.UserHasRole(approverID, form.RoleID); err != nil || !ok {
		return errors.New("approver does not have the current approval role")
	}

	rejectedAt := time.Now().UTC()
	form.State = 4
	form.RejectedBy = &approverID
	form.RejectedAt = &rejectedAt
	form.RejectComment = remark
	form.StateDetail = "Rejected"
	form.UpdatedAt = rejectedAt

	if err := s.repo.Update(form); err != nil {
		return err
	}
	s.notifyRequester(form, "Petty cash rejected", fmt.Sprintf("%s has been rejected", form.Title))

	history := &model.PettyCashHistory{
		PettyCashFormID: form.ID,
		UserID:          &approverID,
		Action:          "Rejected",
		Remark:          remark,
		State:           form.State,
		CreatedAt:       time.Now().UTC(),
	}
	return s.repo.SaveHistory(history)
}

func (s *pettyCashServiceImpl) CancelForm(id string, userID uuid.UUID, remark string) error {
	formUUID, err := uuid.Parse(id)
	if err != nil {
		return errors.New("invalid form id")
	}

	form, err := s.repo.FindByID(formUUID)
	if err != nil {
		return err
	}
	if form.UserID != userID {
		return errors.New("only requester can cancel this form")
	}
	if form.State != 1 && form.State != 4 {
		return errors.New("only draft or rejected forms can be cancelled")
	}

	form.State = 5
	form.StateDetail = "Cancelled"
	form.UpdatedAt = time.Now().UTC()
	if err := s.repo.Update(form); err != nil {
		return err
	}

	return s.repo.SaveHistory(&model.PettyCashHistory{
		PettyCashFormID: form.ID,
		UserID:          &userID,
		Action:          "Cancelled",
		Remark:          remark,
		State:           form.State,
		CreatedAt:       time.Now().UTC(),
	})
}

func (s *pettyCashServiceImpl) ResendForm(id string, userID uuid.UUID, req request.UpdatePettyCashRequest) (*model.PettyCashForm, error) {
	formUUID, err := uuid.Parse(id)
	if err != nil {
		return nil, errors.New("invalid form id")
	}

	form, err := s.repo.FindByID(formUUID)
	if err != nil {
		return nil, err
	}
	if form.UserID != userID {
		return nil, errors.New("only requester can resend this form")
	}
	if form.State != 4 {
		return nil, errors.New("only rejected forms can be resent")
	}

	var newItems []model.PettyCashFormItem
	totalAmount := 0
	for _, item := range req.Items {
		itemDate, err := parsePettyCashItemDate(item.Date)
		if err != nil {
			return nil, err
		}
		newItems = append(newItems, model.PettyCashFormItem{
			PettyCashFormID: form.ID,
			ProjectID:       item.ProjectID,
			ReasonID:        item.ReasonID,
			Description:     item.Description,
			Note:            item.Note,
			Total:           item.Amount,
			Date:            itemDate,
			Attachments:     buildAttachments(item.Attachments),
		})
		totalAmount += item.Amount
	}

	form.Title = req.Title
	form.Note = req.Note
	form.TotalAmount = totalAmount
	form.RejectedBy = nil
	form.RejectedAt = nil
	form.RejectComment = ""
	form.State = 1
	form.StateDetail = "Draft"
	form.UpdatedAt = time.Now().UTC()
	if err := s.repo.UpdateWithItems(form, newItems); err != nil {
		return nil, err
	}

	s.repo.SaveHistory(&model.PettyCashHistory{
		PettyCashFormID: form.ID,
		UserID:          &userID,
		Action:          "Resent",
		State:           2,
		Remark:          req.Remark,
		CreatedAt:       time.Now().UTC(),
	})

	return s.SubmitForm(form.ID.String(), userID, req.Remark)
}

func (s *pettyCashServiceImpl) notifyRequester(form *model.PettyCashForm, title string, message string) {
	_ = s.repo.CreateNotification(&model.Notification{
		UserID:  form.UserID,
		Title:   title,
		Message: message,
		Link:    fmt.Sprintf("/pettycash?id=%s", form.ID.String()),
	})
}

func (s *pettyCashServiceImpl) notifyPendingApprovers(form *model.PettyCashForm, title string, message string) {
	if form.State != 2 || form.RoleID == uuid.Nil {
		return
	}
	users, err := s.repo.FindUsersByRoleID(form.RoleID)
	if err != nil {
		return
	}
	for _, user := range users {
		_ = s.repo.CreateNotification(&model.Notification{
			UserID:  user.ID,
			Title:   title,
			Message: message,
			Link:    fmt.Sprintf("/pettycash/my-tasks?id=%s", form.ID.String()),
		})
	}
}

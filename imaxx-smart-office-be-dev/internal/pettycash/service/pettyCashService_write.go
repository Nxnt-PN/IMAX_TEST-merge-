package service

import (
	"errors"
	"time"

	"imaxx-smart-office-be/internal/pettycash/model"
	"imaxx-smart-office-be/internal/pettycash/request"

	"github.com/google/uuid"
)

func (s *pettyCashServiceImpl) CreatePettyCash(userID uuid.UUID, req request.CreatePettyCashRequest) (*model.PettyCashForm, error) {
	workflow, err := s.repo.GetWorkflowBySystemSlug("petty-cash")
	if err != nil {
		return nil, errors.New("workflow is required before creating petty cash")
	}

	var formItems []model.PettyCashFormItem
	totalAmount := 0
	for _, item := range req.Items {
		itemDate, err := parsePettyCashItemDate(item.Date)
		if err != nil {
			return nil, err
		}
		formItems = append(formItems, model.PettyCashFormItem{
			ProjectID:   item.ProjectID,
			ReasonID:    item.ReasonID,
			Description: item.Description,
			Note:        item.Note,
			Total:       item.Amount,
			Date:        itemDate,
			Attachments: buildAttachments(item.Attachments),
		})
		totalAmount += item.Amount
	}

	form := model.PettyCashForm{
		UserID:      userID,
		WorkflowID:  workflow.ID,
		Title:       req.Title,
		Note:        req.Note,
		State:       1,
		StateDetail: "Draft",
		TotalAmount: totalAmount,
		Items:       formItems,
	}

	if err := s.repo.Create(&form); err != nil {
		return nil, err
	}

	history := &model.PettyCashHistory{
		PettyCashFormID: form.ID,
		UserID:          &userID,
		Action:          "Created",
		State:           form.State,
		Remark:          req.Remark,
		CreatedAt:       time.Now().UTC(),
	}
	s.repo.SaveHistory(history)

	return &form, nil
}

func (s *pettyCashServiceImpl) UpdatePettyCash(id string, userID uuid.UUID, req request.UpdatePettyCashRequest) (*model.PettyCashForm, error) {
	formUUID, err := uuid.Parse(id)
	if err != nil {
		return nil, errors.New("invalid form id")
	}

	form, err := s.repo.FindByID(formUUID)
	if err != nil {
		return nil, errors.New("form not found")
	}
	if form.UserID != userID {
		return nil, errors.New("only requester can update this form")
	}
	if form.State != 1 {
		return nil, errors.New("only draft forms can be updated")
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

	if err := s.repo.UpdateWithItems(form, newItems); err != nil {
		return nil, err
	}

	if req.Remark != "" {
		history := &model.PettyCashHistory{
			PettyCashFormID: form.ID,
			UserID:          &userID,
			Action:          "Updated",
			State:           form.State,
			Remark:          req.Remark,
			CreatedAt:       time.Now().UTC(),
		}
		s.repo.SaveHistory(history)
	}
	return form, nil
}

func parsePettyCashItemDate(value string) (time.Time, error) {
	if value == "" {
		return time.Now(), nil
	}
	if parsed, err := time.Parse("2006-01-02", value); err == nil {
		return parsed, nil
	}
	if parsed, err := time.Parse(time.RFC3339, value); err == nil {
		return parsed, nil
	}
	return time.Time{}, errors.New("invalid item date")
}

func buildAttachments(reqs []request.AttachmentRequest) []model.Attachment {
	attachments := make([]model.Attachment, 0, len(reqs))
	for _, req := range reqs {
		attachments = append(attachments, model.Attachment{
			FileName: req.FileName,
			FilePath: req.FilePath,
			FileSize: req.FileSize,
		})
	}
	return attachments
}

package service

import (
	"context"
	"imaxx-smart-office-be/helper"
	"imaxx-smart-office-be/internal/model"
	"imaxx-smart-office-be/internal/repository"
	"imaxx-smart-office-be/internal/response"

	"github.com/google/uuid"
)

type NotificationService interface {
	FindAll(pagination helper.Pagination, userID uuid.UUID) (*helper.Pagination, error)
	FindUnreadAll(pagination helper.Pagination, userID uuid.UUID) (*helper.Pagination, error)
	GetUnreadCount(userID uuid.UUID) (*int64, error)
	// FindById(id uuid.UUID) (model.Notification, error)
	SetReadById(ctx context.Context, id uuid.UUID) (*model.Notification, error)
	SetReadAll(ctx context.Context, id uuid.UUID) error
}

type NotificationServiceImpl struct {
	NotificationRepository repository.NotificationRepository
}

func NewNotificationServiceImpl(
	notificationRepository repository.NotificationRepository,
) NotificationService {
	return &NotificationServiceImpl{
		NotificationRepository: notificationRepository,
	}
}

func (n *NotificationServiceImpl) rowsWithType(notiPaginate *helper.Pagination) *helper.Pagination {
	notiRows, ok := notiPaginate.Rows.([]model.Notification)
	if !ok {
		notiPaginate.Rows = []response.NotificationResponse{} // slice เปล่า หรือ error
		return notiPaginate
	}
	notiResp := make([]response.NotificationResponse, 0, len(notiRows))
	for _, row := range notiRows {
		notiResp = append(notiResp, row.ToResponse())
	}
	notiPaginate.Rows = notiResp
	return notiPaginate
}

func (n *NotificationServiceImpl) FindAll(pagination helper.Pagination, userID uuid.UUID) (*helper.Pagination, error) {
	notiPaginate, err := n.NotificationRepository.FindAll(pagination, "user_id = ?", []interface{}{userID})
	if err != nil {
		return nil, err
	}
	return n.rowsWithType(notiPaginate), nil
}

func (n *NotificationServiceImpl) FindUnreadAll(pagination helper.Pagination, userID uuid.UUID) (*helper.Pagination, error) {
	notiPaginate, err := n.NotificationRepository.FindAll(pagination, "user_id = ? AND is_read = ?", []interface{}{userID, 0})
	if err != nil {
		return nil, err
	}
	return n.rowsWithType(notiPaginate), nil
}

func (n *NotificationServiceImpl) GetUnreadCount(userID uuid.UUID) (*int64, error) {
	count, err := n.NotificationRepository.FindAllCount("user_id = ? AND is_read = ?", []interface{}{userID, 0})
	if err != nil {
		return nil, err
	}
	return count, nil
}

// func (n *NotificationServiceImpl) FindById(id uuid.UUID) (model.Notification, error) {
// 	data, err := n.NotificationRepository.FindById(id)
// 	return data, err
// }

func (n *NotificationServiceImpl) SetReadById(ctx context.Context, id uuid.UUID) (*model.Notification, error) {
	data, err := n.NotificationRepository.FindById(id)
	if err != nil {
		return nil, helper.NewNotFoundError("ไม่เจอข้อมูล")
	}

	updateData := map[string]interface{}{
		"is_read": 1,
	}
	if err := n.NotificationRepository.Update(ctx, id, updateData); err != nil {
		return nil, err
	}
	//memory and db sync
	data.IsRead = 1

	return &data, err
}

func (n *NotificationServiceImpl) SetReadAll(ctx context.Context, id uuid.UUID) error {
	updateData := map[string]interface{}{
		"is_read": 1,
	}
	if err := n.NotificationRepository.BulkUpdate(ctx, "user_id = ? AND is_read = 0", []interface{}{id}, updateData); err != nil {
		return err
	}

	return nil
}

package repository

import (
	"context"
	"fmt"
	"imaxx-smart-office-be/helper"
	"imaxx-smart-office-be/internal/model"
	"log"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type NotificationRepository interface {
	BulkCreate(ctx context.Context, notis []model.Notification) error
	FindAll(pagination helper.Pagination, query string, params []interface{}) (*helper.Pagination, error)
	FindAllCount(query string, params []interface{}) (*int64, error)
	// FindNotifications(dest interface{}, filter helper.UserFilter) error
	FindById(id uuid.UUID) (model.Notification, error)
	Update(ctx context.Context, id uuid.UUID, data map[string]interface{}) error
	BulkUpdate(ctx context.Context, query string, params []interface{}, data map[string]interface{}) error
}

type NotificationRepositoryImpl struct {
	Db *gorm.DB
}

func NewNotificationRepositoryImpl(Db *gorm.DB) NotificationRepository {
	return &NotificationRepositoryImpl{Db: Db}
}

func (n *NotificationRepositoryImpl) BulkCreate(ctx context.Context, notis []model.Notification) error {
	if len(notis) == 0 {
		return nil
	}

	db := GetDB(ctx, n.Db)
	err := db.Create(&notis).Error
	if err != nil {
		return fmt.Errorf("NotificationRepository.BulkCreate: %w", err)
	}

	// สั่ง Notify แบบ Broadcast โดยใช้คำว่า 'refresh_all' เป็นสัญญาณ
	if err := db.Exec("SELECT pg_notify('leave_updates', 'refresh_all')").Error; err != nil {
		log.Printf("Notify error: %v", err)
	}

	return nil
}

func (n *NotificationRepositoryImpl) FindAll(pagination helper.Pagination, query string, params []interface{}) (*helper.Pagination, error) {
	var notis []model.Notification
	result := n.Db
	if len(params) == 0 && query != "" {
		result = result.Where(query)
	} else {
		result = result.Where(query, params...)
	}
	result = result.Scopes(Paginate(notis, &pagination, query, params, n.Db)).Find(&notis)
	if result.Error != nil {
		return nil, result.Error
	}
	pagination.Rows = notis
	return &pagination, nil
}

func (n *NotificationRepositoryImpl) FindAllCount(query string, params []interface{}) (*int64, error) {
	var count int64
	result := n.Db.Model(model.Notification{})
	if len(params) == 0 && query != "" {
		result = result.Where(query)
	} else {
		result = result.Where(query, params...)
	}
	result = result.Count(&count)
	if result.Error != nil {
		return nil, result.Error
	}
	return &count, nil
}

// func (n *NotificationRepositoryImpl) FindNotifications(dest interface{}, filter helper.UserFilter) error {
// 	query := n.Db.Model(&model.Notification{})
// 	result := query.Where(&filter).Find(dest)
// 	// gorm error
// 	if result.Error != nil {
// 		return fmt.Errorf("repository.FindNotifications: %w", result.Error)
// 	}
// 	// not found error
// 	if result.RowsAffected == 0 {
// 		return helper.ErrNotFound
// 	}
// 	return nil
// }

func (n *NotificationRepositoryImpl) FindById(id uuid.UUID) (model.Notification, error) {
	var noti model.Notification
	err := n.Db.
		First(&noti, id).Error
	return noti, err
}

func (n *NotificationRepositoryImpl) Update(ctx context.Context, id uuid.UUID, data map[string]interface{}) error {
	if err := n.Db.WithContext(ctx).Model(&model.Notification{}).
		Where("id = ?", id).
		Updates(data).Error; err != nil {
		return err
	}
	return nil
}

func (n *NotificationRepositoryImpl) BulkUpdate(ctx context.Context, query string, params []interface{}, data map[string]interface{}) error {
	if err := n.Db.WithContext(ctx).Model(&model.Notification{}).
		Where(query, params...).
		Updates(data).Error; err != nil {
		return err
	}
	return nil
}

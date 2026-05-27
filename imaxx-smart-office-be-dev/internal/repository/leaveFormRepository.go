package repository

import (
	"context"
	"fmt"
	"imaxx-smart-office-be/helper"
	"imaxx-smart-office-be/internal/model"
	"log"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type LeaveFormRepository interface {
	FindAll(pagination helper.Pagination, c helper.LeaveCriteria) *helper.Pagination
	FindById(id uuid.UUID) (model.LeaveForm, error)
	FindByFilterFirst(query string, params []interface{}, scopes ...func(*gorm.DB) *gorm.DB) (model.LeaveForm, error)
	FindByFilter(query string, params []interface{}, scopes ...func(*gorm.DB) *gorm.DB) ([]model.LeaveForm, error)
	FindCountByFilter(query string, params []interface{}, scopes ...func(*gorm.DB) *gorm.DB) (*int64, error)
	FindUserDaysLeaveCum(userID uuid.UUID, leaveType string, year int, state []int) (float64, error)
	Create(ctx context.Context, lf *model.LeaveForm) (*model.LeaveForm, error)
	Update(ctx context.Context, editID uuid.UUID, lf *model.LeaveForm, selectFields ...string) (*model.LeaveForm, error)
	MagicUpdate(ctx context.Context, id uuid.UUID, updates map[string]interface{}, lh *model.LeaveFormHistory) error
	Delete(ctx context.Context, lf *model.LeaveForm) error
}

type LeaveFormRepositoryImpl struct {
	Db *gorm.DB
}

func NewLeaveFormRepositoryImpl(Db *gorm.DB) LeaveFormRepository {
	return &LeaveFormRepositoryImpl{Db: Db}
}

func (l *LeaveFormRepositoryImpl) FindAll(pagination helper.Pagination, c helper.LeaveCriteria) *helper.Pagination {
	var leaveForms []model.LeaveForm

	// Query build
	result := l.Db.Model(&model.LeaveForm{}).
		Preload("User").
		Preload("Role").
		Preload("LeaveFormHistories")

	// ประกอบ WHERE ตาม Data ใน Criteria
	if len(c.IDs) > 0 {
		result = result.Where("id IN ?", c.IDs)
	}
	if c.UserID != nil {
		result = result.Where("user_id = ?", c.UserID)
	}
	if c.Keyword != "" {
		query := "%" + c.Keyword + "%"
		result = result.Joins("User").Where(
			"reason ILIKE ? OR \"User\".first_name ILIKE ? OR \"User\".last_name ILIKE ? OR CONCAT(\"User\".first_name, ' ', \"User\".last_name) ILIKE ?",
			query, query, query, query,
		)
	}
	if c.LeaveType != "" {
		result = result.Where("leave_type = ?", c.LeaveType)
	}
	if len(c.DateRange) == 2 {
		result = result.Where("start_date >= ? AND end_date < ?", c.DateRange[0], c.DateRange[1])
	}
	if c.State != nil {
		result = result.Where("state = ?", *c.State)
	}
	if len(c.RoleIDs) > 0 {
		result = result.Scopes(helper.FilterByRoleWithChildren(c.RoleIDs))
	}
	if c.Name != "" {
		result = result.Joins("User").
			Where("\"User\".first_name ILIKE ? OR \"User\".last_name ILIKE ? OR CONCAT(\"User\".first_name, ' ', \"User\".last_name) ILIKE ?",
				"%"+c.Name+"%", "%"+c.Name+"%", "%"+c.Name+"%")
	}

	// Pagination
	if pagination.Limit != -1 {
		result = result.Scopes(Paginate(leaveForms, &pagination, "", nil, result))
	}
	result = result.Find(&leaveForms)
	helper.ErrorPanic(result.Error)
	pagination.Rows = leaveForms

	return &pagination
}

func (l *LeaveFormRepositoryImpl) FindById(id uuid.UUID) (model.LeaveForm, error) {
	var leaveForm model.LeaveForm
	err := l.Db.
		Preload("LeaveFormHistories").
		Preload("User").
		First(&leaveForm, id).Error
	return leaveForm, err
}

func (l *LeaveFormRepositoryImpl) FindByFilterFirst(query string, params []interface{}, scopes ...func(*gorm.DB) *gorm.DB) (model.LeaveForm, error) {
	var leaveForm model.LeaveForm

	err := l.Db.
		Preload("LeaveFormHistories").
		Preload("Role").
		Scopes(scopes...).
		Where(query, params...).
		First(&leaveForm).Error

	return leaveForm, err
}

func (l *LeaveFormRepositoryImpl) FindByFilter(query string, params []interface{}, scopes ...func(*gorm.DB) *gorm.DB) ([]model.LeaveForm, error) {
	var leaveForms []model.LeaveForm

	err := l.Db.
		Preload("User").
		Preload("Role").
		Scopes(scopes...).
		Where(query, params...).
		Find(&leaveForms).Error

	if err != nil {
		log.Printf("error LeaveFormRepo.FindByFilter: %v", err)
		return nil, err
	}

	return leaveForms, nil
}

func (l *LeaveFormRepositoryImpl) FindCountByFilter(query string, params []interface{}, scopes ...func(*gorm.DB) *gorm.DB) (*int64, error) {
	var count int64
	err := l.Db.
		Model(model.LeaveForm{}).
		Preload("User").
		Preload("Role").
		Scopes(scopes...).
		Where(query, params...).
		Count(&count).Error

	if err != nil {
		log.Printf("error LeaveFormRepo.FindCountByFilter: %v", err)
		return nil, err
	}

	return &count, nil
}

func (l *LeaveFormRepositoryImpl) FindUserDaysLeaveCum(userID uuid.UUID, leaveType string, year int, state []int) (float64, error) {
	var totalDays float64
	start := time.Date(year, time.January, 1, 0, 0, 0, 0, time.Local)
	end := time.Date(year, time.December, 31, 23, 59, 59, 0, time.Local)

	query := `
        SELECT COALESCE(SUM(total_days), 0)
        FROM leave_forms
        WHERE user_id = ?
        AND leave_type = ?
		AND start_date >= ?
		AND end_date < ?
        AND state IN (?)
        AND deleted_at IS NULL
    `
	err := l.Db.Raw(query, userID, leaveType, start, end, state).Scan(&totalDays).Error
	if err != nil {
		return 0, fmt.Errorf("failed to calculate leave days for user %s: %w", userID, err)
	}

	return totalDays, nil
}

// Repository - ใส่ context ให้ gorm
func (l *LeaveFormRepositoryImpl) Create(ctx context.Context, lf *model.LeaveForm) (*model.LeaveForm, error) {
	db := GetDB(ctx, l.Db)
	err := db.Create(lf).Error

	if err != nil {
		return nil, fmt.Errorf("LeaveFormRepository.Create: %w", err)
	}

	// สั่ง Notify แบบ Broadcast โดยใช้คำว่า 'refresh_all' เป็นสัญญาณ
	if err := db.Exec("SELECT pg_notify('leave_updates', 'refresh_all')").Error; err != nil {
		log.Printf("Notify error: %v", err)
	}

	return lf, nil
}

func (l *LeaveFormRepositoryImpl) Update(ctx context.Context, editID uuid.UUID, lf *model.LeaveForm, selectFields ...string) (*model.LeaveForm, error) {
	// ทำ transaction เสร็จพร้อมกัน *ย้ายไป service ใน step ถัดไป เพราะใช้ GetDB แทน
	db := GetDB(ctx, l.Db)
	return lf, db.Transaction(func(tx *gorm.DB) error {
		query := tx.Model(&model.LeaveForm{}).WithContext(ctx).Where("id = ?", editID)
		// ฟิลด์เฉพาะ ถ้ามี
		if len(selectFields) > 0 {
			query = query.Select(selectFields)
		}

		if err := query.Updates(lf).Error; err != nil {
			return fmt.Errorf("LeaveFormRepository.Update: %w", err)
		}

		// สั่ง Notify แบบ Broadcast โดยใช้คำว่า 'refresh_all' เป็นสัญญาณ
		if err := tx.Exec("SELECT pg_notify('leave_updates', 'refresh_all')").Error; err != nil {
			log.Printf("Notify error: %v", err)
		}

		//History ส่งมาได้ทีละตัว
		if len(lf.LeaveFormHistories) > 0 {
			newHistory := lf.LeaveFormHistories[len(lf.LeaveFormHistories)-1]
			newHistory.LeaveFormID = editID
			if err := tx.WithContext(ctx).Create(&newHistory).Error; err != nil {
				return fmt.Errorf("LeaveFormRepository.Update: %w", err)
			}
		}

		return nil
	})
}

func (l *LeaveFormRepositoryImpl) MagicUpdate(ctx context.Context, id uuid.UUID, updates map[string]interface{}, lh *model.LeaveFormHistory) error {
	return l.Db.Transaction(func(tx *gorm.DB) error {
		if err := tx.WithContext(ctx).Model(&model.LeaveForm{}).
			Where("id = ?", id).
			Updates(updates).Error; err != nil {
			return err
		}
		if lh != nil {
			if err := tx.WithContext(ctx).Create(&lh).Error; err != nil {
				return err
			}
		}

		// Notify 'refresh_all'
		if err := tx.Exec("SELECT pg_notify('leave_updates', 'refresh_all')").Error; err != nil {
			log.Printf("Notify error: %v", err)
		}

		return nil
	})
}

func (l *LeaveFormRepositoryImpl) Delete(ctx context.Context, lf *model.LeaveForm) error {
	userID, _ := ctx.Value("current_user_id").(uuid.UUID)

	return l.Db.WithContext(ctx).Model(lf).Updates(map[string]interface{}{
		"deleted_at": time.Now(),
		"deleted_by": userID,
	}).Error
}

package repository

import (
	"errors"
	"fmt"
	"imaxx-smart-office-be/enums"
	"imaxx-smart-office-be/helper"
	"imaxx-smart-office-be/internal/model"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type LeaveQuotaRepository interface {
	FindAll(pagination helper.Pagination, query string, params []interface{}) *helper.Pagination
	FindById(id uuid.UUID) (model.LeaveQuota, *gorm.DB)
	FindByFilterFirst(query string, params []interface{}) (model.LeaveQuota, *gorm.DB)
	FindUserLeaveQuota(userID uuid.UUID, leaveType enums.LeaveType, leaveStartDateYear int) (float64, error)
	Create(w model.LeaveQuota) (model.LeaveQuota, error)
	Update(id uuid.UUID, data model.LeaveQuota) error
	Delete(id uuid.UUID) error
}

type LeaveQuotaRepositoryImpl struct {
	Db *gorm.DB
}

func NewLeaveQuotaRepositoryImpl(Db *gorm.DB) LeaveQuotaRepository {
	return &LeaveQuotaRepositoryImpl{Db: Db}
}

func (l *LeaveQuotaRepositoryImpl) FindAll(pagination helper.Pagination, query string, params []interface{}) *helper.Pagination {
	var leaveQuotas []model.LeaveQuota
	result := l.Db.Preload("LeaveQuotaDetails")
	if len(params) == 0 && query != "" {
		result = result.Where(query)
	} else {
		result = result.Where(query, params...)
	}
	result = result.Scopes(Paginate(leaveQuotas, &pagination, query, params, l.Db)).Find(&leaveQuotas)
	helper.ErrorPanic(result.Error)
	pagination.Rows = leaveQuotas
	return &pagination
}

func (l *LeaveQuotaRepositoryImpl) FindById(id uuid.UUID) (model.LeaveQuota, *gorm.DB) {
	var leaveQuota model.LeaveQuota
	result := l.Db.
		Preload("LeaveQuotaDetails").
		First(&leaveQuota, id)
	return leaveQuota, result
}

func (l *LeaveQuotaRepositoryImpl) FindByFilterFirst(query string, params []interface{}) (model.LeaveQuota, *gorm.DB) {
	var leaveQuota model.LeaveQuota
	result := l.Db.
		Preload("LeaveQuotaDetails").
		Where(query, params...).First(&leaveQuota)
	return leaveQuota, result
}

var (
	ErrUserNotFound  = errors.New("user not found")
	ErrQuotaNotFound = errors.New("leave quota configuration not found for this work year")
)

func (r *LeaveQuotaRepositoryImpl) FindUserLeaveQuota(userID uuid.UUID, leaveType enums.LeaveType, year int) (float64, error) {
	var quota float64

	// leave type validation
	if !leaveType.IsValid() {
		return 0, fmt.Errorf("invalid leave type: %s", leaveType)
	}
	// Column
	columnName := fmt.Sprintf("%s_quota", leaveType)

	query := fmt.Sprintf(`
        SELECT lqd.%s
        FROM users u
        JOIN leave_quota_details lqd ON 
            EXTRACT(YEAR FROM AGE(?::date, u.employed_at)) >= lqd.work_year_min
            AND EXTRACT(YEAR FROM AGE(?::date, u.employed_at)) < lqd.work_year_max
        JOIN leave_quota lq ON lq.id = lqd.leave_quota_id
        WHERE u.id = ? AND lq.year = ?
        LIMIT 1
    `, columnName)

	endDate := fmt.Sprintf("%d-12-31", year-1)
	err := r.Db.Raw(query, endDate, endDate, userID, year).Scan(&quota).Error

	return quota, err
}

func (l *LeaveQuotaRepositoryImpl) Create(leaveQuota model.LeaveQuota) (model.LeaveQuota, error) {
	result := l.Db.Create(&leaveQuota)
	if result.Error != nil {
		return model.LeaveQuota{}, result.Error
	}

	return leaveQuota, nil
}

func (l *LeaveQuotaRepositoryImpl) Update(id uuid.UUID, data model.LeaveQuota) error {
	// เริ่ม Transaction ให้ข้อมูลเสร็จพร้อมกัน
	return l.Db.Transaction(func(tx *gorm.DB) error {
		var leaveQuota model.LeaveQuota
		if err := tx.Model(&leaveQuota).Where("id = ? ", id).Updates(data).Error; err != nil {
			return err
		}

		//Updates ignore int value = 0 เลยต้องเซทอีกที
		if data.Status == 0 {
			if err := tx.Model(&leaveQuota).Where("id = ? ", id).Updates(map[string]interface{}{
				"status": data.Status,
			}).Error; err != nil {
				return err
			}
		}

		// new details
		if len(data.LeaveQuotaDetails) > 0 {
			// hard delete old leave_quota_details
			err := tx.Unscoped().Where("leave_quota_id = ?", id).Delete(&model.LeaveQuotaDetail{}).Error
			if err != nil {
				return err
			}
			for i := range data.LeaveQuotaDetails {
				data.LeaveQuotaDetails[i].LeaveQuotaID = id
				// ล้าง id ลูกใน data ทิ้ง
				data.LeaveQuotaDetails[i].BaseModel.ID = nil
			}

			if err := tx.Create(&data.LeaveQuotaDetails).Error; err != nil {
				return err
			}
		}
		return nil
	})
}

func (l *LeaveQuotaRepositoryImpl) Delete(id uuid.UUID) error {
	if err := l.Db.Select("LeaveQuotaDetails").Delete(&model.LeaveQuota{BaseModel: model.BaseModel{ID: &id}}).Error; err != nil {
		return err
	}

	return nil
}

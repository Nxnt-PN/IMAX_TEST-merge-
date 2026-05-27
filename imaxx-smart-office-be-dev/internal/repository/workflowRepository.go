package repository

import (
	"imaxx-smart-office-be/helper"
	"imaxx-smart-office-be/internal/model"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type WorkflowRepository interface {
	FindAll(pagination helper.Pagination, query string, params []interface{}) *helper.Pagination
	FindActiveAll(pagination helper.Pagination, query string, params []interface{}) *helper.Pagination
	FindById(id uuid.UUID) (model.Workflow, *gorm.DB)
	FindByFilterFirst(query string, params []interface{}) (model.Workflow, *gorm.DB)
	FindDetailByFilterFirst(query string, params []interface{}, orderBy ...string) (model.WorkflowDetail, error)
	Create(w model.Workflow) (model.Workflow, error)
	Update(id uuid.UUID, data model.Workflow) error
	Delete(id uuid.UUID) error
}

type WorkflowRepositoryImpl struct {
	Db *gorm.DB
}

func NewWorkflowRepositoryImpl(Db *gorm.DB) WorkflowRepository {
	return &WorkflowRepositoryImpl{Db: Db}
}

func (w *WorkflowRepositoryImpl) FindAll(pagination helper.Pagination, query string, params []interface{}) *helper.Pagination {
	var workflows []model.Workflow
	result := w.Db.
		Preload("WorkflowDetails.Role").
		Preload("Systems")
	if len(params) == 0 && query != "" {
		result = result.Where(query)
	} else {
		result = result.Where(query, params...)
	}
	result = result.Scopes(Paginate(workflows, &pagination, query, params, w.Db)).Find(&workflows)
	helper.ErrorPanic(result.Error)
	pagination.Rows = workflows
	return &pagination
}

func (w *WorkflowRepositoryImpl) FindActiveAll(pagination helper.Pagination, query string, params []interface{}) *helper.Pagination {
	var workflows []model.Workflow
	result := w.Db.
		Preload("WorkflowDetails.Role").
		Preload("Systems").
		Scopes(model.IsActive)
	if len(params) == 0 && query != "" {
		result = result.Where(query)
	} else {
		result = result.Where(query, params...)
	}
	result = result.
		Scopes(Paginate(workflows, &pagination, query, params, w.Db, result)).
		Find(&workflows)
	helper.ErrorPanic(result.Error)
	pagination.Rows = workflows
	return &pagination
}

func (w *WorkflowRepositoryImpl) FindById(id uuid.UUID) (model.Workflow, *gorm.DB) {
	var workflow model.Workflow
	result := w.Db.
		Preload("WorkflowDetails.Role").
		Preload("Systems").
		First(&workflow, id)
	return workflow, result
}

func (w *WorkflowRepositoryImpl) FindByFilterFirst(query string, params []interface{}) (model.Workflow, *gorm.DB) {
	var workflow model.Workflow
	result := w.Db.
		Preload("WorkflowDetails").
		Preload("Systems").
		Where(query, params...).First(&workflow)
	return workflow, result
}

func (w *WorkflowRepositoryImpl) FindDetailByFilterFirst(queryStr string, params []interface{}, orderBy ...string) (model.WorkflowDetail, error) {
	var workflowDetail model.WorkflowDetail
	query := w.Db.Where(queryStr, params...)

	if len(orderBy) > 0 && orderBy[0] != "" {
		query = query.Order(orderBy[0])
	}
	err := query.First(&workflowDetail).Error

	return workflowDetail, err
}

func (w *WorkflowRepositoryImpl) Create(workflow model.Workflow) (model.Workflow, error) {
	// gorm จะสร้าง workflow และ workflow_details และ systems ให้ใน Transction เดียวกันอัตโนมัติ
	result := w.Db.Create(&workflow)
	if result.Error != nil {
		return model.Workflow{}, result.Error
	}

	return workflow, nil
}

func (w *WorkflowRepositoryImpl) Update(id uuid.UUID, data model.Workflow) error {
	// เริ่ม Transaction ให้ข้อมูลเสร็จพร้อมกัน
	return w.Db.Transaction(func(tx *gorm.DB) error {
		var workflow model.Workflow
		if err := tx.Model(&workflow).Where("id = ? ", id).Updates(data).Error; err != nil {
			return err
		}

		//Updates ignore int value = 0 เลยต้องเซทอีกที
		if data.Status == 0 {
			if err := tx.Model(&workflow).Where("id = ? ", id).Updates(map[string]interface{}{
				"status": data.Status,
			}).Error; err != nil {
				return err
			}
		}

		// new details
		if len(data.WorkflowDetails) > 0 {
			// hard delete old leave_quota_details
			err := tx.Unscoped().Where("workflow_id = ?", id).Delete(&model.WorkflowDetail{}).Error
			if err != nil {
				return err
			}
			for i := range data.WorkflowDetails {
				data.WorkflowDetails[i].WorkflowID = id
				// ล้าง id ลูกใน data ทิ้ง
				data.WorkflowDetails[i].BaseModel.ID = nil
			}

			if err := tx.Create(&data.WorkflowDetails).Error; err != nil {
				return err
			}
		}

		return nil
	})
}

func (w *WorkflowRepositoryImpl) Delete(id uuid.UUID) error {
	if err := w.Db.Select("WorkflowDetails", "Systems").Delete(&model.Workflow{BaseModel: model.BaseModel{ID: &id}}).Error; err != nil {
		return err
	}

	return nil
}

package service

import (
	"errors"
	"imaxx-smart-office-be/helper"
	"imaxx-smart-office-be/internal/model"
	"imaxx-smart-office-be/internal/repository"
	"imaxx-smart-office-be/internal/request"

	"github.com/google/uuid"
	"github.com/jinzhu/copier"
	"gorm.io/gorm"
)

type WorkflowService interface {
	FindAll(pagination helper.Pagination) *helper.Pagination
	FindActiveAll(pagination helper.Pagination) *helper.Pagination
	Create(req request.CreateWorkflowRequest) (model.Workflow, error)
	FindById(id uuid.UUID) (model.Workflow, error)
	Update(id uuid.UUID, user request.UpdateWorkflowRequest) (model.Workflow, error)
	Delete(id uuid.UUID, actionID uuid.UUID) error
	CheckNameDuplicated(name string, currentId *uuid.UUID) bool
}

type WorkflowServiceImpl struct {
	WorkflowRepository repository.WorkflowRepository
}

func NewWorkflowServiceImpl(workflowRepository repository.WorkflowRepository) WorkflowService {
	return &WorkflowServiceImpl{
		WorkflowRepository: workflowRepository,
	}
}

func (w *WorkflowServiceImpl) FindAll(pagination helper.Pagination) *helper.Pagination {
	var filters []interface{}
	var whereText string = ""
	if pagination.Keyword != "" {
		whereText += "name ILIKE ? "
		filters = append(filters, "%"+pagination.Keyword+"%")
	}

	return w.WorkflowRepository.FindAll(pagination, whereText, filters)
}

func (w *WorkflowServiceImpl) FindActiveAll(pagination helper.Pagination) *helper.Pagination {
	var filters []interface{}
	var whereText string = ""
	if pagination.Keyword != "" {
		whereText += "name ILIKE ? "
		filters = append(filters, "%"+pagination.Keyword+"%")
	}

	return w.WorkflowRepository.FindActiveAll(pagination, whereText, filters)
}

func (w *WorkflowServiceImpl) Create(req request.CreateWorkflowRequest) (model.Workflow, error) {
	workflowCreate := model.Workflow{}

	// copier จะก๊อปปี้ WorkflowDetails, Systems จาก req ไปยัง model
	// ชื่อฟิลด์ใน Request กับ Model ตรงกัน
	if err := copier.Copy(&workflowCreate, &req); err != nil {
		return model.Workflow{}, err
	}

	//เรียก respository ทีเดียว
	resp, err := w.WorkflowRepository.Create(workflowCreate)
	if err != nil {
		return model.Workflow{}, err
	}

	return resp, nil
}

func (w *WorkflowServiceImpl) FindById(id uuid.UUID) (model.Workflow, error) {
	data, result := w.WorkflowRepository.FindById(id)
	return data, result.Error
}

func (w *WorkflowServiceImpl) CheckNameDuplicated(name string, currentId *uuid.UUID) bool {
	var filters []interface{}
	filters = append(filters, name)
	whereText := "name = ?"
	if currentId != nil {
		whereText += " AND id != ?"
		filters = append(filters, currentId)
	}
	_, result := w.WorkflowRepository.FindByFilterFirst(whereText, filters)

	return !errors.Is(result.Error, gorm.ErrRecordNotFound)
}

func (w *WorkflowServiceImpl) Update(id uuid.UUID, workflow request.UpdateWorkflowRequest) (model.Workflow, error) {
	workflowUpdate := model.Workflow{}
	copier.Copy(&workflowUpdate, &workflow)

	w.WorkflowRepository.Update(id, workflowUpdate)

	result, err := w.FindById(id)

	return result, err
}

func (w *WorkflowServiceImpl) Delete(id uuid.UUID, actionID uuid.UUID) error {
	w.WorkflowRepository.Update(id, model.Workflow{
		BaseModel: model.BaseModel{
			DeletedBy: &actionID,
		},
	})

	return w.WorkflowRepository.Delete(id)
}

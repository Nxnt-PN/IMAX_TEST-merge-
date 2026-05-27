package service

import (
	"imaxx-smart-office-be/helper"
	"imaxx-smart-office-be/internal/model"
	"imaxx-smart-office-be/internal/repository"
	"imaxx-smart-office-be/internal/request"

	"github.com/google/uuid"
	"github.com/jinzhu/copier"
)

type SystemService interface {
	FindAll(pagination helper.Pagination) *helper.Pagination
	FindById(id uuid.UUID) (model.System, error)
	Update(id uuid.UUID, systemRequest request.UpdateSystemRequest) (model.System, error)
	// CheckNameDuplicated(name string, currentId *uuid.UUID) bool
}

type SystemServiceImpl struct {
	SystemRepository repository.SystemRepository
}

func NewSystemServiceImpl(systemRepository repository.SystemRepository) SystemService {
	return &SystemServiceImpl{
		SystemRepository: systemRepository,
	}
}

func (s *SystemServiceImpl) FindAll(pagination helper.Pagination) *helper.Pagination {
	var filters []interface{}
	var whereText string = ""
	if pagination.Keyword != "" {
		whereText += "name ILIKE ? "
		filters = append(filters, "%"+pagination.Keyword+"%")
	}

	return s.SystemRepository.FindAll(pagination, whereText, filters)
}

func (s *SystemServiceImpl) FindById(id uuid.UUID) (model.System, error) {
	data, result := s.SystemRepository.FindById(id)
	return data, result.Error
}

// func (s *SystemServiceImpl) CheckNameDuplicated(name string, currentId *uuid.UUID) bool {
// 	var filters []interface{}
// 	filters = append(filters, name)
// 	whereText := "name = ?"
// 	if currentId != nil {
// 		whereText += " AND id != ?"
// 		filters = append(filters, currentId)
// 	}
// 	_, result := s.SystemRepository.FindByFilterFirst(whereText, filters)

// 	return !errors.Is(result.Error, gorm.ErrRecordNotFound)
// }

func (s *SystemServiceImpl) Update(id uuid.UUID, role request.UpdateSystemRequest) (model.System, error) {
	systemUpdate := model.System{}
	copier.Copy(&systemUpdate, &role)
	s.SystemRepository.Update(id, systemUpdate)
	return s.FindById(id)
}

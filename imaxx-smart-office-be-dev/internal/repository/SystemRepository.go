package repository

import (
	"imaxx-smart-office-be/enums"
	"imaxx-smart-office-be/helper"
	"imaxx-smart-office-be/internal/model"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type SystemRepository interface {
	FindAll(pagination helper.Pagination, query string, params []interface{}) *helper.Pagination
	FindById(id uuid.UUID) (model.System, *gorm.DB)
	FindBySlug(slug enums.SystemSlug) (model.System, error)
	Update(id uuid.UUID, data model.System)
	// FindByFilterFirst(query string, params []interface{}) (model.System, *gorm.DB)
}

type SystemRepositoryImpl struct {
	Db *gorm.DB
}

func NewSystemRepositoryImpl(Db *gorm.DB) SystemRepository {
	return &SystemRepositoryImpl{Db: Db}
}

func (s *SystemRepositoryImpl) FindAll(pagination helper.Pagination, query string, params []interface{}) *helper.Pagination {
	var systems []model.System
	result := s.Db
	if len(params) == 0 && query != "" {
		result = result.Where(query)
	} else {
		result = result.Where(query, params...)
	}
	result = result.Scopes(Paginate(systems, &pagination, query, params, s.Db)).Find(&systems)
	helper.ErrorPanic(result.Error)
	pagination.Rows = systems
	return &pagination
}

func (s *SystemRepositoryImpl) FindById(id uuid.UUID) (model.System, *gorm.DB) {
	var system model.System
	result := s.Db.First(&system, id)
	return system, result
}

func (s *SystemRepositoryImpl) FindBySlug(slug enums.SystemSlug) (model.System, error) {
	var system model.System
	err := s.Db.Where("slug = ?", slug).First(&system).Error
	return system, err
}

// func (s *SystemRepositoryImpl) FindByFilterFirst(query string, params []interface{}) (model.System, *gorm.DB) {
// 	var system model.System
// 	result := s.Db.Where(query, params...).First(&system)
// 	return system, result
// }

func (s *SystemRepositoryImpl) Update(id uuid.UUID, data model.System) {
	var system model.System
	s.Db.Model(&system).Where("id = ? ", id).Updates(data)

	// //Updates ignore int value = 0 เลยต้องเซทอีกที
	// if data.Status == 0 {
	// 	s.Db.Model(&system).Where("id = ? ", id).Updates(map[string]interface{}{
	// 		"status": data.Status,
	// 	})
	// }
}

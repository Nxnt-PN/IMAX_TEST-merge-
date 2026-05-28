package repository

import (
	"imaxx-smart-office-be/helper"
	"imaxx-smart-office-be/internal/model"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type LocationRepository interface {
	FindAll(pagination helper.Pagination, query string, params []interface{}) *helper.Pagination
	FindById(id uuid.UUID) (model.Location, *gorm.DB)
	FindByFilterFirst(query string, params []interface{}) (model.Location, *gorm.DB)
	Create(location model.Location) model.Location
	Update(id uuid.UUID, data model.Location)
	Delete(id uuid.UUID)
}

type LocationRepositoryImpl struct {
	Db *gorm.DB
}

func NewLocationRepositoryImpl(Db *gorm.DB) LocationRepository {
	return &LocationRepositoryImpl{Db: Db}
}

func (r *LocationRepositoryImpl) FindAll(pagination helper.Pagination, query string, params []interface{}) *helper.Pagination {
	var locations []model.Location
	result := r.Db.Model(&model.Location{})
	if len(params) == 0 && query != "" {
		result = result.Where(query)
	} else {
		result = result.Where(query, params...)
	}
	result = result.Scopes(Paginate(locations, &pagination, query, params, r.Db)).Find(&locations)
	helper.ErrorPanic(result.Error)
	pagination.Rows = locations
	return &pagination
}

func (r *LocationRepositoryImpl) FindById(id uuid.UUID) (model.Location, *gorm.DB) {
	var location model.Location
	result := r.Db.First(&location, id)
	return location, result
}

func (r *LocationRepositoryImpl) FindByFilterFirst(query string, params []interface{}) (model.Location, *gorm.DB) {
	var location model.Location
	result := r.Db.Where(query, params...).First(&location)
	return location, result
}

func (r *LocationRepositoryImpl) Create(location model.Location) model.Location {
	result := r.Db.Create(&location)
	helper.ErrorPanic(result.Error)
	return location
}

func (r *LocationRepositoryImpl) Update(id uuid.UUID, data model.Location) {
	var location model.Location
	result := r.Db.Model(&location).Where("id = ?", id).Updates(data)
	helper.ErrorPanic(result.Error)
	if data.Status == 0 {
		r.Db.Model(&location).Where("id = ?", id).Updates(map[string]interface{}{"status": data.Status})
	}
}

func (r *LocationRepositoryImpl) Delete(id uuid.UUID) {
	result := r.Db.Delete(&model.Location{}, id)
	helper.ErrorPanic(result.Error)
}

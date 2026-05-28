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

type LocationService interface {
	FindAll(pagination helper.Pagination) *helper.Pagination
	Create(location request.CreateLocationRequest) model.Location
	FindById(id uuid.UUID) (model.Location, error)
	Update(id uuid.UUID, location request.UpdateLocationRequest) (model.Location, error)
	Delete(id uuid.UUID, actionID uuid.UUID)
	CheckNameDuplicated(name string, currentId *uuid.UUID) bool
}

type LocationServiceImpl struct {
	LocationRepository repository.LocationRepository
}

func NewLocationServiceImpl(locationRepository repository.LocationRepository) LocationService {
	return &LocationServiceImpl{LocationRepository: locationRepository}
}

func (s *LocationServiceImpl) FindAll(pagination helper.Pagination) *helper.Pagination {
	var filters []interface{}
	whereText := ""
	if pagination.Keyword != "" {
		whereText = "location_name ILIKE ?"
		filters = append(filters, "%"+pagination.Keyword+"%")
	}
	return s.LocationRepository.FindAll(pagination, whereText, filters)
}

func (s *LocationServiceImpl) Create(location request.CreateLocationRequest) model.Location {
	locationCreate := model.Location{}
	copier.Copy(&locationCreate, &location)
	return s.LocationRepository.Create(locationCreate)
}

func (s *LocationServiceImpl) FindById(id uuid.UUID) (model.Location, error) {
	data, result := s.LocationRepository.FindById(id)
	return data, result.Error
}

func (s *LocationServiceImpl) Update(id uuid.UUID, location request.UpdateLocationRequest) (model.Location, error) {
	locationUpdate := model.Location{}
	copier.Copy(&locationUpdate, &location)
	s.LocationRepository.Update(id, locationUpdate)
	return s.FindById(id)
}

func (s *LocationServiceImpl) Delete(id uuid.UUID, actionID uuid.UUID) {
	s.LocationRepository.Update(id, model.Location{
		BaseModel: model.BaseModel{DeletedBy: &actionID},
	})
	s.LocationRepository.Delete(id)
}

func (s *LocationServiceImpl) CheckNameDuplicated(name string, currentId *uuid.UUID) bool {
	filters := []interface{}{name}
	whereText := "location_name = ?"
	if currentId != nil {
		whereText += " AND id != ?"
		filters = append(filters, currentId)
	}
	_, result := s.LocationRepository.FindByFilterFirst(whereText, filters)
	return !errors.Is(result.Error, gorm.ErrRecordNotFound)
}

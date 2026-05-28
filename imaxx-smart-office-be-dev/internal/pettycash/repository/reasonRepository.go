package repository

import (
	"imaxx-smart-office-be/internal/pettycash/model"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ReasonFilter struct {
	System   string
	SystemID *uuid.UUID
}

type ReasonRepository interface {
	FindAll(filter ReasonFilter) ([]model.Reason, error)
	FindByID(id string) (model.Reason, error)
	Create(reason *model.Reason) error
	Update(reason *model.Reason) error
	Delete(reason *model.Reason) error
	FindSystemBySlug(slug string) (*model.System, error)
}

type reasonRepositoryImpl struct {
	db *gorm.DB
}

func NewReasonRepository(db *gorm.DB) ReasonRepository {
	return &reasonRepositoryImpl{db: db}
}

func (r *reasonRepositoryImpl) FindAll(filter ReasonFilter) ([]model.Reason, error) {
	var reasons []model.Reason
	query := r.db.Model(&model.Reason{}).Preload("System")
	if filter.System != "" {
		query = query.Joins("JOIN systems ON systems.id = petty_cash_reasons.system_id").Where("systems.slug = ?", filter.System)
	}
	if filter.SystemID != nil {
		query = query.Where("petty_cash_reasons.system_id = ?", filter.SystemID)
	}
	err := query.Find(&reasons).Error
	return reasons, err
}

func (r *reasonRepositoryImpl) FindByID(id string) (model.Reason, error) {
	var reason model.Reason
	err := r.db.Preload("System").First(&reason, "id = ?", id).Error
	return reason, err
}

func (r *reasonRepositoryImpl) Create(reason *model.Reason) error {
	return r.db.Create(reason).Error
}

func (r *reasonRepositoryImpl) Update(reason *model.Reason) error {
	return r.db.Save(reason).Error
}

func (r *reasonRepositoryImpl) Delete(reason *model.Reason) error {
	return r.db.Delete(reason).Error
}

func (r *reasonRepositoryImpl) FindSystemBySlug(slug string) (*model.System, error) {
	var system model.System
	err := r.db.First(&system, "slug = ?", slug).Error
	return &system, err
}

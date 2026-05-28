package repository

import (
	"imaxx-smart-office-be/internal/pettycash/model"

	"gorm.io/gorm"
)

type ProjectRepository interface {
	FindAll() ([]model.Project, error)
	FindByID(id string) (model.Project, error)
	Create(project *model.Project) error
	Update(project *model.Project) error
	Delete(project *model.Project) error
}

type projectRepositoryImpl struct {
	db *gorm.DB
}

func NewProjectRepository(db *gorm.DB) ProjectRepository {
	return &projectRepositoryImpl{db: db}
}

func (r *projectRepositoryImpl) FindAll() ([]model.Project, error) {
	var projects []model.Project
	err := r.db.Find(&projects).Error
	return projects, err
}

func (r *projectRepositoryImpl) FindByID(id string) (model.Project, error) {
	var project model.Project
	err := r.db.First(&project, "id = ?", id).Error
	return project, err
}

func (r *projectRepositoryImpl) Create(project *model.Project) error {
	return r.db.Create(project).Error
}

func (r *projectRepositoryImpl) Update(project *model.Project) error {
	return r.db.Save(project).Error
}

func (r *projectRepositoryImpl) Delete(project *model.Project) error {
	return r.db.Delete(project).Error
}

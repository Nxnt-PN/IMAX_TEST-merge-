package service

import (
	"imaxx-smart-office-be/internal/pettycash/model"
	"imaxx-smart-office-be/internal/pettycash/repository"
	"imaxx-smart-office-be/internal/pettycash/request"
)

type ProjectService interface {
	GetAllProjects() ([]model.Project, error)
	CreateProject(req request.ProjectRequest) (model.Project, error)
	UpdateProject(id string, req request.ProjectRequest) (model.Project, error)
	DeleteProject(id string) error
}

type projectServiceImpl struct {
	projectRepo repository.ProjectRepository
}

func NewProjectService(repo repository.ProjectRepository) ProjectService {
	return &projectServiceImpl{projectRepo: repo}
}

func (s *projectServiceImpl) GetAllProjects() ([]model.Project, error) {
	return s.projectRepo.FindAll()
}

func (s *projectServiceImpl) CreateProject(req request.ProjectRequest) (model.Project, error) {
	project := model.Project{
		ProjectName: req.ProjectName,
		Description: req.Description,
	}
	err := s.projectRepo.Create(&project)
	return project, err
}

func (s *projectServiceImpl) UpdateProject(id string, req request.ProjectRequest) (model.Project, error) {
	project, err := s.projectRepo.FindByID(id)
	if err != nil {
		return project, err
	}
	project.ProjectName = req.ProjectName
	project.Description = req.Description
	err = s.projectRepo.Update(&project)
	return project, err
}

func (s *projectServiceImpl) DeleteProject(id string) error {
	project, err := s.projectRepo.FindByID(id)
	if err != nil {
		return err
	}
	return s.projectRepo.Delete(&project)
}

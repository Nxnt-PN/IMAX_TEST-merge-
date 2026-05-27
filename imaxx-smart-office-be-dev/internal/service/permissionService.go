package service

import (
	"imaxx-smart-office-be/helper"
	"imaxx-smart-office-be/internal/repository"
)

type PermissionService interface {
	FindAll(pagination helper.Pagination) *helper.Pagination
}

type PermissionServiceImpl struct {
	PermissionRepository repository.PermissionRepository
}

func NewPermissionServiceImpl(permissionRepository repository.PermissionRepository) PermissionService {
	return &PermissionServiceImpl{
		PermissionRepository: permissionRepository,
	}
}

func (r *PermissionServiceImpl) FindAll(pagination helper.Pagination) *helper.Pagination {
	var filters []interface{}
	var whereText string = ""
	if pagination.Keyword != "" {
		whereText += "name like ? "
		filters = append(filters, "%"+pagination.Keyword+"%")
	}

	return r.PermissionRepository.FindAll(pagination, whereText, filters)
}

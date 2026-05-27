package repository

import (
	"imaxx-smart-office-be/helper"
	"imaxx-smart-office-be/internal/model"

	"gorm.io/gorm"
)

type PermissionRepository interface {
	FindAll(pagination helper.Pagination, query string, params []interface{}) *helper.Pagination
}

type PermissionRepositoryImpl struct {
	Db *gorm.DB
}

func NewPermissionRepositoryImpl(Db *gorm.DB) PermissionRepository {
	return &PermissionRepositoryImpl{Db: Db}
}

func (p *PermissionRepositoryImpl) FindAll(pagination helper.Pagination, query string, params []interface{}) *helper.Pagination {
	var permissions []model.Permission
	result := p.Db
	if len(params) == 0 && query != "" {
		result = p.Db.Where(query)
	} else {
		result = p.Db.Where(query, params...)
	}
	result = result.Scopes(Paginate(permissions, &pagination, query, params, p.Db)).Find(&permissions)
	helper.ErrorPanic(result.Error)
	pagination.Rows = permissions
	return &pagination
}

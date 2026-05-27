package repository

import (
	"imaxx-smart-office-be/helper"
	"imaxx-smart-office-be/internal/model"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type RoleRepository interface {
	FindAll(pagination helper.Pagination, query string, params []interface{}) *helper.Pagination
	FindActiveAll(pagination helper.Pagination, query string, params []interface{}) *helper.Pagination
	FindById(id uuid.UUID) (model.Role, *gorm.DB)
	Create(user model.Role) model.Role
	Update(id uuid.UUID, data model.Role)
	Delete(id uuid.UUID)
	FindByFilterFirst(query string, params []interface{}) (model.Role, *gorm.DB)

	UpdateRolePermissions(role *model.Role, permissionIds []uuid.UUID)
	UpdateParentChildRoles(role *model.Role, childRoleIds []uuid.UUID)
}

type RoleRepositoryImpl struct {
	Db *gorm.DB
}

func NewRoleRepositoryImpl(Db *gorm.DB) RoleRepository {
	return &RoleRepositoryImpl{Db: Db}
}

func (r *RoleRepositoryImpl) FindAll(pagination helper.Pagination, query string, params []interface{}) *helper.Pagination {
	var roles []model.Role
	result := r.Db.
		Preload("Permissions").
		Preload("ChildRoles")
	if len(params) == 0 && query != "" {
		result = result.Where(query)
	} else {
		result = result.Where(query, params...)
	}
	result = result.Scopes(Paginate(roles, &pagination, query, params, r.Db)).Find(&roles)
	helper.ErrorPanic(result.Error)
	pagination.Rows = roles
	return &pagination
}

func (r *RoleRepositoryImpl) FindActiveAll(pagination helper.Pagination, query string, params []interface{}) *helper.Pagination {
	var roles []model.Role
	result := r.Db.
		Preload("Permissions").
		Preload("ChildRoles").
		Scopes(model.IsActive)
	if len(params) == 0 && query != "" {
		result = result.Where(query)
	} else {
		result = result.Where(query, params...)
	}
	result = result.
		Scopes(Paginate(roles, &pagination, query, params, r.Db, result)).
		Find(&roles)
	helper.ErrorPanic(result.Error)
	pagination.Rows = roles
	return &pagination
}

func (r *RoleRepositoryImpl) FindById(id uuid.UUID) (model.Role, *gorm.DB) {
	var role model.Role
	result := r.Db.
		Preload("Permissions").
		Preload("ChildRoles").
		First(&role, id)
	return role, result
}

func (r *RoleRepositoryImpl) FindByFilterFirst(query string, params []interface{}) (model.Role, *gorm.DB) {
	var role model.Role
	result := r.Db.Where(query, params...).First(&role)
	return role, result
}

func (r *RoleRepositoryImpl) Create(role model.Role) model.Role {
	result := r.Db.Create(&role)
	helper.ErrorPanic(result.Error)
	return role
}
func (r *RoleRepositoryImpl) Update(id uuid.UUID, data model.Role) {
	var role model.Role
	r.Db.Model(&role).Where("id = ? ", id).Updates(data)

	//Updates ignore int value = 0 เลยต้องเซทอีกที
	if data.Status == 0 {
		r.Db.Model(&role).Where("id = ? ", id).Updates(map[string]interface{}{
			"status": data.Status,
		})
	}
}
func (r *RoleRepositoryImpl) UpdateRolePermissions(role *model.Role, permissionIds []uuid.UUID) {
	var permissions []model.Permission
	r.Db.Where("id in ?", permissionIds).Find(&permissions)
	r.Db.Model(&role).Association("Permissions").Replace(permissions)
}
func (r *RoleRepositoryImpl) UpdateParentChildRoles(role *model.Role, childRoleIds []uuid.UUID) {
	var childRoles []model.Role
	r.Db.Where("id in ?", childRoleIds).Find(&childRoles)
	r.Db.Model(&role).Association("ChildRoles").Replace(childRoles)
}
func (r *RoleRepositoryImpl) Delete(id uuid.UUID) {
	r.Db.Delete(&model.Role{}, id)
}

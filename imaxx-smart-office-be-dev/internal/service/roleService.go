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

type RoleService interface {
	FindAll(pagination helper.Pagination) *helper.Pagination
	FindActiveAll(pagination helper.Pagination) *helper.Pagination
	Create(role request.CreateRoleRequest) model.Role
	FindById(id uuid.UUID) (model.Role, error)
	Update(id uuid.UUID, roleRequest request.UpdateRoleRequest) (model.Role, error)
	Delete(id uuid.UUID, actionID uuid.UUID)
	CheckNameDuplicated(name string, currentId *uuid.UUID) bool
}

type RoleServiceImpl struct {
	RoleRepository repository.RoleRepository
}

func NewRoleServiceImpl(roleRepository repository.RoleRepository) RoleService {
	return &RoleServiceImpl{
		RoleRepository: roleRepository,
	}
}

func (r *RoleServiceImpl) FindAll(pagination helper.Pagination) *helper.Pagination {
	var filters []interface{}
	var whereText string = ""
	if pagination.Keyword != "" {
		whereText += "name ILIKE ? "
		filters = append(filters, "%"+pagination.Keyword+"%")
	}

	return r.RoleRepository.FindAll(pagination, whereText, filters)
}

func (r *RoleServiceImpl) FindActiveAll(pagination helper.Pagination) *helper.Pagination {
	var filters []interface{}
	var whereText string = ""
	if pagination.Keyword != "" {
		whereText += "name ILIKE ? "
		filters = append(filters, "%"+pagination.Keyword+"%")
	}

	return r.RoleRepository.FindActiveAll(pagination, whereText, filters)
}

func (r *RoleServiceImpl) Create(role request.CreateRoleRequest) model.Role {
	roleCreate := model.Role{}
	copier.Copy(&roleCreate, &role)
	resp := r.RoleRepository.Create(roleCreate)
	if len(role.PermissionIDs) > 0 {
		r.RoleRepository.UpdateRolePermissions(&resp, role.PermissionIDs)
	}
	if len(role.ChildRoleIDs) > 0 {
		r.RoleRepository.UpdateParentChildRoles(&resp, role.ChildRoleIDs)
	}
	return resp
}

func (r *RoleServiceImpl) FindById(id uuid.UUID) (model.Role, error) {
	data, result := r.RoleRepository.FindById(id)
	return data, result.Error
}

func (r *RoleServiceImpl) CheckNameDuplicated(name string, currentId *uuid.UUID) bool {
	var filters []interface{}
	filters = append(filters, name)
	whereText := "name = ?"
	if currentId != nil {
		whereText += " AND id != ?"
		filters = append(filters, currentId)
	}
	_, result := r.RoleRepository.FindByFilterFirst(whereText, filters)

	return !errors.Is(result.Error, gorm.ErrRecordNotFound)
}

func (r *RoleServiceImpl) Update(id uuid.UUID, role request.UpdateRoleRequest) (model.Role, error) {
	roleUpdate := model.Role{}
	copier.Copy(&roleUpdate, &role)
	r.RoleRepository.Update(id, roleUpdate)
	result, err := r.FindById(id)
	if err == nil && role.PermissionIDs != nil {
		r.RoleRepository.UpdateRolePermissions(&result, role.PermissionIDs)
	}
	if err == nil && role.ChildRoleIDs != nil {
		r.RoleRepository.UpdateParentChildRoles(&result, role.ChildRoleIDs)
	}
	return result, err
}

func (r *RoleServiceImpl) Delete(id uuid.UUID, actionID uuid.UUID) {
	r.RoleRepository.Update(id, model.Role{
		BaseModel: model.BaseModel{
			DeletedBy: &actionID,
		},
	})
	r.RoleRepository.Delete(id)
}

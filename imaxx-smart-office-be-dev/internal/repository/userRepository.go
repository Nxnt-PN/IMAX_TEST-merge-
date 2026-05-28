package repository

import (
	"context"
	"fmt"
	"imaxx-smart-office-be/helper"
	"imaxx-smart-office-be/internal/model"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type UserRepository interface {
	FindAll(pagination helper.Pagination, query string, params []interface{}) *helper.Pagination
	FindAllRaw(pagination helper.Pagination, query string, params []interface{}) []model.User
	FindActiveAll(pagination helper.Pagination, query string, params []interface{}) *helper.Pagination
	FindUsers(dest interface{}, filter helper.UserFilter) error
	FindUser(dest interface{}, filter helper.UserFilter) error
	GetUserRoleIDs(userID uuid.UUID) ([]uuid.UUID, error)
	FindById(id uuid.UUID) (model.User, error)
	FindByFilterFirst(query string, params []interface{}) (model.User, *gorm.DB)
	IsAdmin(userID uuid.UUID) bool
	Create(user model.User) model.User
	Update(id uuid.UUID, data model.User)
	MagicUpdate(ctx context.Context, id uuid.UUID, updates map[string]interface{}) error
	Delete(id uuid.UUID)
	UpdateUserLocation(id uuid.UUID, locationID *uuid.UUID)

	UpdateUserRoles(user *model.User, roleIds []uuid.UUID)
}

type UserRepositoryImpl struct {
	Db *gorm.DB
}

func NewUserRepositoryImpl(Db *gorm.DB) UserRepository {
	return &UserRepositoryImpl{Db: Db}
}

func (u *UserRepositoryImpl) FindAll(pagination helper.Pagination, query string, params []interface{}) *helper.Pagination {
	var users []model.User
	result := u.Db.Preload("Roles.Permissions").Preload("Location")
	if len(params) == 0 && query != "" {
		result = result.Where(query)
	} else {
		result = result.Where(query, params...)
	}
	result = result.Scopes(Paginate(users, &pagination, query, params, u.Db)).Find(&users)
	helper.ErrorPanic(result.Error)
	pagination.Rows = users
	return &pagination
}

func (u *UserRepositoryImpl) FindAllRaw(pagination helper.Pagination, query string, params []interface{}) []model.User {
	var users []model.User
	result := u.Db.Preload("Roles").Preload("Location")
	if len(params) == 0 && query != "" {
		result = result.Where(query)
	} else {
		result = result.Where(query, params...)
	}
	result = result.Scopes(Paginate(users, &pagination, query, params, u.Db)).Find(&users)
	helper.ErrorPanic(result.Error)
	return users
}

func (u *UserRepositoryImpl) FindActiveAll(pagination helper.Pagination, query string, params []interface{}) *helper.Pagination {
	var users []model.User
	result := u.Db.
		Preload("Roles.Permissions").
		Preload("Location").
		Scopes(model.IsActive)
	if len(params) == 0 && query != "" {
		result = result.Where(query)
	} else {
		result = result.Where(query, params...)
	}
	result = result.
		Scopes(Paginate(users, &pagination, query, params, u.Db, result)).
		Find(&users)
	helper.ErrorPanic(result.Error)
	pagination.Rows = users
	return &pagination
}

func (u *UserRepositoryImpl) FindUsers(dest interface{}, filter helper.UserFilter) error {
	query := u.Db.Model(&model.User{})
	// role
	if filter.RoleID != nil && filter.ChildUserID == nil {
		query = query.Joins("JOIN user_roles ON user_roles.user_id = users.id").
			Where("user_roles.role_id = ?", filter.RoleID)
	}
	if filter.RoleID != nil && filter.ChildUserID != nil {
		var roleIds []uuid.UUID
		u.Db.Model(&model.ParentChildRole{}).
			Joins("JOIN user_roles on user_roles.role_id = parent_child_roles.child_role_id").
			Where("user_roles.user_id = ?", filter.ChildUserID).
			Pluck("parent_role_id", &roleIds)
		var parentUserIds []uuid.UUID
		u.Db.Model(&model.User{}).
			Joins("JOIN user_roles on user_roles.user_id = users.id").
			Where("user_roles.role_id IN (?)", roleIds).
			Pluck("users.id", &parentUserIds)
		query = query.Joins("JOIN user_roles ON user_roles.user_id = users.id").
			Where("user_roles.role_id = ? AND users.id IN (?)", filter.RoleID, parentUserIds)
	}
	result := query.Where(&filter).Find(dest)
	// gorm error
	if result.Error != nil {
		return fmt.Errorf("repository.FindUsers: %w", result.Error)
	}
	// not found error
	if result.RowsAffected == 0 {
		return helper.NewNotFoundError("ไม่เจอผู้ใช้")
	}
	return nil
}

func (u *UserRepositoryImpl) FindUser(dest interface{}, filter helper.UserFilter) error {
	query := u.Db.Model(&model.User{})

	if filter.RoleID != nil {
		query = query.Joins("JOIN user_roles ON user_roles.user_id = users.id").
			Where("user_roles.role_id = ?", filter.RoleID)
	}

	// .Take() is faster casue it doesn't have to Order By PK
	result := query.Where(&filter).Take(dest)

	if result.Error != nil {
		// error gorm.ErrRecordNotFound
		return result.Error
	}

	return nil
}

func (u *UserRepositoryImpl) GetUserRoleIDs(userID uuid.UUID) ([]uuid.UUID, error) {
	var roleIDs []uuid.UUID

	err := u.Db.Table("user_roles").
		Where("user_id = ?", userID).
		Pluck("role_id", &roleIDs).
		Error

	return roleIDs, err
}

func (u *UserRepositoryImpl) FindById(id uuid.UUID) (model.User, error) {
	var user model.User
	err := u.Db.
		Preload("Roles.Permissions").
		Preload("Location").
		First(&user, id).Error
	return user, err
}
func (u *UserRepositoryImpl) FindByFilterFirst(query string, params []interface{}) (model.User, *gorm.DB) {
	var user model.User
	result := u.Db.
		Preload("Roles.Permissions").
		Preload("Location").
		Where(query, params...).First(&user)
	return user, result
}

func (u *UserRepositoryImpl) IsAdmin(userID uuid.UUID) bool {
	var user model.User
	err := u.Db.
		Joins("JOIN user_roles ON user_roles.user_id = users.id").
		Joins("JOIN roles ON roles.id = user_roles.role_id").
		Where("users.id = ? AND roles.name = ?", userID, "Administrator"). // put in enums in next state
		First(&user).Error

	return err == nil
}

func (u *UserRepositoryImpl) Create(user model.User) model.User {
	result := u.Db.Create(&user)
	helper.ErrorPanic(result.Error)
	return user
}
func (u *UserRepositoryImpl) Update(id uuid.UUID, data model.User) {
	var user model.User
	result := u.Db.Model(&user).Where("id = ? ", id).Updates(data)
	helper.ErrorPanic(result.Error)

	//Updates ignore int value = 0 เลยต้องเซทอีกที
	if data.Status == 0 {
		u.Db.Model(&user).Where("id = ? ", id).Updates(map[string]interface{}{
			"status": data.Status,
		})
	}
}

func (u *UserRepositoryImpl) UpdateUserLocation(id uuid.UUID, locationID *uuid.UUID) {
	var user model.User
	result := u.Db.Model(&user).Where("id = ?", id).Updates(map[string]interface{}{
		"location_id": locationID,
	})
	helper.ErrorPanic(result.Error)
}

func (u *UserRepositoryImpl) MagicUpdate(ctx context.Context, id uuid.UUID, updates map[string]interface{}) error {
	return u.Db.Transaction(func(tx *gorm.DB) error {
		if err := tx.WithContext(ctx).Model(&model.User{}).
			Where("id = ?", id).
			Updates(updates).Error; err != nil {
			return err
		}

		// // Notify 'refresh_all'
		// if err := tx.Exec("SELECT pg_notify('leave_updates', 'refresh_all')").Error; err != nil {
		// 	log.Printf("Notify error: %v", err)
		// }

		return nil
	})
}

func (u *UserRepositoryImpl) UpdateUserRoles(user *model.User, roleIds []uuid.UUID) {
	var roles []model.Role
	u.Db.Where("id in ?", roleIds).Find(&roles)
	result := u.Db.Model(&user).Association("Roles").Replace(roles)
	helper.ErrorPanic(result)
}
func (u *UserRepositoryImpl) Delete(id uuid.UUID) {
	result := u.Db.Delete(&model.User{}, id)
	helper.ErrorPanic(result.Error)
}

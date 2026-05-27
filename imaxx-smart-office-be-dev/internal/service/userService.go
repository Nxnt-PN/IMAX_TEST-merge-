package service

import (
	"context"
	"errors"
	"fmt"
	"imaxx-smart-office-be/helper"
	"imaxx-smart-office-be/internal/model"
	"imaxx-smart-office-be/internal/repository"
	"imaxx-smart-office-be/internal/request"
	"mime/multipart"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jinzhu/copier"
	"gorm.io/gorm"
)

type UserService interface {
	FindAll(pagination helper.Pagination) *helper.Pagination
	FindActiveAll(pagination helper.Pagination) *helper.Pagination
	Create(user request.CreateUserRequest) model.User
	FindById(id uuid.UUID) (model.User, error)
	IsAdmin(id uuid.UUID) bool
	Update(id uuid.UUID, user request.UpdateUserRequest) (model.User, error)
	Delete(id uuid.UUID, actionID uuid.UUID)
	Authenticate(username string, password string) *model.User
	CheckUsernameDuplicated(username string, currentId *uuid.UUID) bool
	CheckPasswordDuplicated(password string, currentId *uuid.UUID) error
	PatchUpdate(ctx context.Context, id uuid.UUID, updates map[string]interface{}) error
	GetAvatarPath(ctx *gin.Context, userID uuid.UUID, file *multipart.FileHeader) (string, string, error)
}

type UserServiceImpl struct {
	UserRepository repository.UserRepository
}

func NewUserServiceImpl(userRepository repository.UserRepository) UserService {
	return &UserServiceImpl{
		UserRepository: userRepository,
	}
}

func (u *UserServiceImpl) FindAll(pagination helper.Pagination) *helper.Pagination {
	var filters []interface{}
	var whereText string = ""
	if pagination.Keyword != "" {
		whereText += `username ILIKE ? OR
		email ILIKE ? OR
		first_name ILIKE ? OR
		last_name ILIKE ? OR
		CONCAT(first_name, ' ', last_name) ILIKE ?
		OR EXISTS (
				SELECT 1 FROM user_roles ur
				INNER JOIN roles r ON r.id = ur.role_id
				WHERE ur.user_id = users.id AND r.name ILIKE ?)`
		filters = append(filters, "%"+pagination.Keyword+"%")
		filters = append(filters, "%"+pagination.Keyword+"%")
		filters = append(filters, "%"+pagination.Keyword+"%")
		filters = append(filters, "%"+pagination.Keyword+"%")
		filters = append(filters, "%"+pagination.Keyword+"%")
		filters = append(filters, "%"+pagination.Keyword+"%")
	}

	return u.UserRepository.FindAll(pagination, whereText, filters)
}

func (u *UserServiceImpl) FindActiveAll(pagination helper.Pagination) *helper.Pagination {
	var filters []interface{}
	var whereText string = ""
	if pagination.Keyword != "" {
		whereText += `username ILIKE ? OR
		email ILIKE ? OR
		first_name ILIKE ? OR
		last_name ILIKE ? OR
		CONCAT(first_name, ' ', last_name) ILIKE ?
		OR EXISTS (
				SELECT 1 FROM user_roles ur
				INNER JOIN roles r ON r.id = ur.role_id
				WHERE ur.user_id = users.id AND r.name ILIKE ?)`
		filters = append(filters, "%"+pagination.Keyword+"%")
		filters = append(filters, "%"+pagination.Keyword+"%")
		filters = append(filters, "%"+pagination.Keyword+"%")
		filters = append(filters, "%"+pagination.Keyword+"%")
		filters = append(filters, "%"+pagination.Keyword+"%")
		filters = append(filters, "%"+pagination.Keyword+"%")
	}

	return u.UserRepository.FindActiveAll(pagination, whereText, filters)
}

func (u *UserServiceImpl) Create(user request.CreateUserRequest) model.User {
	userCreate := model.User{}
	copier.Copy(&userCreate, &user)
	hashPassword, _ := helper.HashPassword(userCreate.Password)
	userCreate.Password = hashPassword
	resp := u.UserRepository.Create(userCreate)
	if len(user.RoleIDs) > 0 {
		u.UserRepository.UpdateUserRoles(&resp, user.RoleIDs)
	}

	return resp
}

func (u *UserServiceImpl) FindById(id uuid.UUID) (model.User, error) {
	data, err := u.UserRepository.FindById(id)
	return data, err
}

func (u *UserServiceImpl) IsAdmin(id uuid.UUID) bool {
	result := u.UserRepository.IsAdmin(id)
	return result
}

func (u *UserServiceImpl) Authenticate(username string, password string) *model.User {
	var filters []interface{}
	filters = append(filters, username)
	data, result := u.UserRepository.FindByFilterFirst("username = ? AND status = 1", filters)
	if result.Error != nil {
		return nil
	}
	if !helper.VerifyPassword(password, data.Password) {
		return nil
	}

	return &data
}

func (u *UserServiceImpl) CheckUsernameDuplicated(username string, currentId *uuid.UUID) bool {
	var filters []interface{}
	filters = append(filters, username)
	whereText := "username = ?"
	if currentId != nil {
		whereText += " AND id != ?"
		filters = append(filters, currentId)
	}
	_, result := u.UserRepository.FindByFilterFirst(whereText, filters)

	return !errors.Is(result.Error, gorm.ErrRecordNotFound)
}

func (u *UserServiceImpl) CheckPasswordDuplicated(password string, currentId *uuid.UUID) error {
	var filters []interface{}
	filters = append(filters, currentId)
	data, result := u.UserRepository.FindByFilterFirst("id = ? AND status = 1", filters)
	if result.Error != nil {
		return result.Error
	}

	if helper.VerifyPassword(password, data.Password) {
		return helper.NewValidationError("Password ไม่สามารถเป็นอันเดิมได้")
	}
	return nil
}

func (u *UserServiceImpl) Update(id uuid.UUID, user request.UpdateUserRequest) (model.User, error) {
	//if password change
	if user.Password != nil {
		hashPassword, _ := helper.HashPassword(*user.Password)
		user.Password = &hashPassword
	}
	userUpdate := model.User{}
	copier.Copy(&userUpdate, &user)

	u.UserRepository.Update(id, userUpdate)

	result, err := u.FindById(id)

	if err == nil && user.RoleIDs != nil {
		u.UserRepository.UpdateUserRoles(&result, user.RoleIDs)
	}

	return result, err
}

func (u *UserServiceImpl) Delete(id uuid.UUID, actionID uuid.UUID) {
	u.UserRepository.Update(id, model.User{
		BaseModel: model.BaseModel{
			DeletedBy: &actionID,
		},
	})
	u.UserRepository.Delete(id)
}

func (u *UserServiceImpl) PatchUpdate(ctx context.Context, id uuid.UUID, updates map[string]interface{}) error {
	return u.UserRepository.MagicUpdate(ctx, id, updates)
}

func (u *UserServiceImpl) GetAvatarPath(ctx *gin.Context, userID uuid.UUID, file *multipart.FileHeader) (string, string, error) {
	// find id
	user, err := u.UserRepository.FindById(userID)
	if err != nil {
		return "", "", helper.NewNotFoundError("ไม่พบข้อมูล: " + err.Error())
	}
	// file validate
	if err := helper.ImageValidation(file); err != nil {
		return "", "", err
	}

	// file dest
	uploadPath := fmt.Sprintf("uploads/users/avatar/%s/%s", userID, file.Filename)

	//old file path (if has)
	var oldFilePath string
	if user.AvatarPath != nil && *user.AvatarPath != uploadPath {
		oldFilePath = *user.AvatarPath
	}
	return uploadPath, oldFilePath, nil
}

package controller

import (
	"imaxx-smart-office-be/helper"
	"imaxx-smart-office-be/internal/model"
	"imaxx-smart-office-be/internal/request"
	"imaxx-smart-office-be/internal/response"
	"imaxx-smart-office-be/internal/service"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type UserController struct {
	userService service.UserService
}

func NewUserController(service service.UserService) *UserController {
	return &UserController{
		userService: service,
	}
}

// Authenticate godoc
// @Summary Authenticate user
// @Description authenticate
// @Tags users
// @Accept json
// @Produce json
// @Param request body request.AuthenticateRequest true "authenticate payload"
// @Success 200 {object} response.DefaultResponse
// @Failure 401 {object} response.DefaultResponse
// @Router /users/authenticate [post]
func (controller *UserController) Authenticate(ctx *gin.Context) {
	req := request.AuthenticateRequest{}
	err := ctx.ShouldBindJSON(&req)
	helper.ErrorPanic(err)
	ctx.Header("Content-Type", "application/json")

	loginUser := controller.userService.Authenticate(req.Username, req.Password)
	if loginUser == nil {
		ctx.JSON(http.StatusUnauthorized, response.DefaultResponse{
			Status:  "fail",
			Message: "Username และ password ไม่ถูกต้อง",
			Data:    nil,
		})
		return
	}

	expiredAt := time.Now().Add(time.Hour * 48).Unix()
	claims := &response.AuthClaims{
		ID:       *loginUser.ID,
		Username: loginUser.Username,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: expiredAt,
			Issuer:    "iMAXX",
			IssuedAt:  time.Now().Unix(),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	//encoded string
	t, err := token.SignedString([]byte(os.Getenv("JWT_SECRET")))

	refreshExpiredAt := time.Now().Add(time.Hour * 24 * 30).Unix()
	refreshClaims := &response.AuthClaims{
		ID:       *loginUser.ID,
		Username: loginUser.Username,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: refreshExpiredAt,
			Issuer:    "iMAXX",
			IssuedAt:  time.Now().Unix(),
		},
	}
	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)
	rt, err := refreshToken.SignedString([]byte(os.Getenv("JWT_SECRET")))

	helper.ErrorPanic(err)
	resp := response.AuthResponse{
		Token:            t,
		User:             loginUser,
		ExpiredAt:        expiredAt,
		RefreshToken:     rt,
		RefreshExpiredAt: refreshExpiredAt,
	}

	ctx.JSON(http.StatusOK, response.DefaultResponse{
		Status:  "success",
		Message: "เข้าสู่ระบบสำเร็จ",
		Data:    resp,
	})
}

// RefreshToken godoc
// @Summary RefreshToken user
// @Description refresh token
// @Tags users
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.DefaultResponse
// @Failure 401 {object} response.DefaultResponse
// @Router /users/refresh-token [post]
func (controller *UserController) RefreshToken(ctx *gin.Context) {
	userID, _ := ctx.MustGet("user_id").(uuid.UUID)

	loginUser, _ := controller.userService.FindById(userID)

	expiredAt := time.Now().Add(time.Hour * 48).Unix()
	claims := &response.AuthClaims{
		ID:       *loginUser.ID,
		Username: loginUser.Username,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: expiredAt,
			Issuer:    "iMAXX",
			IssuedAt:  time.Now().Unix(),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	//encoded string
	t, err := token.SignedString([]byte(os.Getenv("JWT_SECRET")))

	refreshExpiredAt := time.Now().Add(time.Hour * 24 * 30).Unix()
	refreshClaims := &response.AuthClaims{
		ID:       *loginUser.ID,
		Username: loginUser.Username,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: refreshExpiredAt,
			Issuer:    "iMAXX",
			IssuedAt:  time.Now().Unix(),
		},
	}
	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)
	rt, err := refreshToken.SignedString([]byte(os.Getenv("JWT_SECRET")))

	helper.ErrorPanic(err)
	resp := response.AuthResponse{
		Token:            t,
		User:             loginUser,
		ExpiredAt:        expiredAt,
		RefreshToken:     rt,
		RefreshExpiredAt: refreshExpiredAt,
	}

	ctx.JSON(http.StatusOK, response.DefaultResponse{
		Status:  "success",
		Message: "Refresh Token เรียบร้อย",
		Data:    resp,
	})
}

// FindAllUser godoc
// @Summary FindAllUser user
// @Description find all user
// @Tags users
// @Accept json
// @Produce json
// @Param page query int false "page number" default(1)
// @Param limit query int false "limit per page number" default(10)
// @Param sort query string false "sort sql string ex. created_at desc" default(created_at desc)
// @Param keyword query string false "keyword search"
// @Security BearerAuth
// @Success 200 {object} response.DefaultResponse
// @Failure 401 {object} response.DefaultResponse
// @Router /users [get]
func (controller *UserController) FindAll(ctx *gin.Context) {
	var pagination helper.Pagination
	ctx.ShouldBindQuery(&pagination)
	if pagination.Page == 0 {
		pagination = pagination.NewPagination("created_at desc")
	}

	resp := controller.userService.FindAll(pagination)

	ctx.Header("Content-Type", "application/json")
	ctx.JSON(http.StatusOK, response.DefaultResponse{
		Status:  "success",
		Message: "เรียกข้อมูลเรียบร้อย",
		Data:    resp,
	})
}

// FindActiveAllUser godoc
// @Summary FindActiveAllUser user
// @Description find active all user
// @Tags users
// @Accept json
// @Produce json
// @Param page query int false "page number" default(1)
// @Param limit query int false "limit per page number" default(10)
// @Param sort query string false "sort sql string ex. created_at desc" default(created_at desc)
// @Param keyword query string false "keyword search"
// @Security BearerAuth
// @Success 200 {object} response.DefaultResponse
// @Failure 401 {object} response.DefaultResponse
// @Router /users/active [get]
func (controller *UserController) FindActiveAll(ctx *gin.Context) {
	var pagination helper.Pagination
	ctx.ShouldBindQuery(&pagination)
	if pagination.Page == 0 {
		pagination = pagination.NewPagination("created_at desc")
	}

	resp := controller.userService.FindActiveAll(pagination)

	ctx.Header("Content-Type", "application/json")
	ctx.JSON(http.StatusOK, response.DefaultResponse{
		Status:  "success",
		Message: "เรียกข้อมูลเรียบร้อย",
		Data:    resp,
	})
}

// FindById godoc
// @Summary FindById user
// @Description find by id user
// @Tags users
// @Accept json
// @Produce json
// @Param id path string true "User ID (uuid)"
// @Security BearerAuth
// @Success 200 {object} response.DefaultResponse
// @Failure 401 {object} response.DefaultResponse
// @Router /users/{id} [get]
func (controller *UserController) FindById(ctx *gin.Context) {
	paramId := ctx.Param("id")
	editID, errUuid := uuid.Parse(paramId)
	helper.ErrorPanic(errUuid)
	ctx.Header("Content-Type", "application/json")

	userData, errQuery := controller.userService.FindById(editID)
	if errQuery != nil {
		ctx.JSON(http.StatusNotFound, response.DefaultResponse{
			Status:  "fail",
			Message: "ไม่พบข้อมูล",
			Data:    nil,
		})
		return
	}
	resp := response.DefaultResponse{
		Status:  "success",
		Message: "เรียกข้อมูล User เรียบร้อย",
		Data:    userData,
	}

	ctx.JSON(http.StatusOK, resp)

}

// Me godoc
// @Summary Get my profile users
// @Description Get current user profile information
// @Tags users
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.DefaultResponse
// @Failure 401 {object} response.DefaultResponse
// @Router /users/me [get]
func (controller *UserController) Me(ctx *gin.Context) {
	userID, _ := ctx.MustGet("user_id").(uuid.UUID)
	ctx.Header("Content-Type", "application/json")

	userData, errQuery := controller.userService.FindById(userID)
	if errQuery != nil {
		ctx.JSON(http.StatusNotFound, response.DefaultResponse{
			Status:  "fail",
			Message: "ไม่พบข้อมูล",
			Data:    nil,
		})
		return
	}
	resp := response.DefaultResponse{
		Status:  "success",
		Message: "เรียกข้อมูล User เรียบร้อย",
		Data:    userData,
	}

	ctx.JSON(http.StatusOK, resp)

}

// CreateUser godoc
// @Summary CreateUser user
// @Description create user
// @Tags users
// @Accept json
// @Produce json
// @Param request body request.CreateUserRequest true "create user payload"
// @Security BearerAuth
// @Success 201 {object} response.DefaultResponse
// @Failure 401 {object} response.DefaultResponse
// @Router /users [post]
func (controller *UserController) Create(ctx *gin.Context) {
	userID, _ := ctx.MustGet("user_id").(uuid.UUID)
	ctx.Header("Content-Type", "application/json")
	req := request.CreateUserRequest{}
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, response.DefaultResponse{
			Status:  "fail",
			Message: "ค่าที่ส่งมาไม่ถูกต้อง",
			Data: gin.H{
				"errors": err.Error(),
			},
		})
		return
	}

	if controller.userService.CheckUsernameDuplicated(req.Username, &uuid.Nil) {
		ctx.JSON(http.StatusBadRequest, response.DefaultResponse{
			Status:  "fail",
			Message: "Username ถูกใช้แล้ว",
			Data:    nil,
		})
		return
	}
	now := time.Now()
	req.CreatedBy = &userID
	req.CreatedAt = &now
	created := controller.userService.Create(req)
	resp := response.DefaultResponse{
		Status:  "success",
		Message: "สร้าง User เรียบร้อย",
		Data:    created,
	}

	ctx.JSON(http.StatusCreated, resp)
}

// UpdateUser godoc
// @Summary UpdateUser user
// @Description update user
// @Tags users
// @Accept json
// @Produce json
// @Param request body request.UpdateUserRequest true "update user payload"
// @Param id path string true "User ID (uuid)"
// @Security BearerAuth
// @Success 200 {object} response.DefaultResponse
// @Failure 401 {object} response.DefaultResponse
// @Router /users/{id} [put]
func (controller *UserController) Update(ctx *gin.Context) {
	userID, _ := ctx.MustGet("user_id").(uuid.UUID)
	paramId := ctx.Param("id")
	editID, errUuid := uuid.Parse(paramId)
	helper.ErrorPanic(errUuid)
	ctx.Header("Content-Type", "application/json")
	req := request.UpdateUserRequest{}
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, response.DefaultResponse{
			Status:  "fail",
			Message: "ค่าที่ส่งมาไม่ถูกต้อง",
			Data: gin.H{
				"errors": err.Error(),
			},
		})
		return
	}

	if controller.userService.CheckUsernameDuplicated(*req.Username, &editID) {
		ctx.JSON(http.StatusBadRequest, response.DefaultResponse{
			Status:  "fail",
			Message: "Username ถูกใช้แล้ว",
			Data:    nil,
		})
		return
	}

	req.UpdatedBy = &userID
	now := time.Now()
	req.UpdatedAt = &now
	userData, errQuery := controller.userService.Update(editID, req)
	if errQuery != nil {
		ctx.JSON(http.StatusNotFound, response.DefaultResponse{
			Status:  "fail",
			Message: "ไม่พบข้อมูล",
			Data:    nil,
		})
		return
	}

	resp := response.DefaultResponse{
		Status:  "success",
		Message: "แก้ไข User เรียบร้อย",
		Data:    userData,
	}

	ctx.JSON(http.StatusOK, resp)
}

type EditPassword struct {
	Password string `validate:"required" json:"password"`
}

// UpdateUserPwd godoc
// @Summary Update user password
// @Description update password by user
// @Tags users
// @Accept json
// @Produce json
// @Param request body EditPassword true "update user password"
// @Security BearerAuth
// @Success 200 {object} response.DefaultResponse
// @Failure 401 {object} response.DefaultResponse
// @Router /users/me/password [patch]
func (controller *UserController) UpdateUserPwd(ctx *gin.Context) {
	userID, _ := ctx.MustGet("user_id").(uuid.UUID)
	ctx.Header("Content-Type", "application/json")
	password := EditPassword{}
	if err := ctx.ShouldBindJSON(&password); err != nil {
		ctx.JSON(http.StatusBadRequest, response.DefaultResponse{
			Status:  "fail",
			Message: "ค่าที่ส่งมาไม่ถูกต้อง",
			Data: gin.H{
				"errors": err.Error(),
			},
		})
		return
	}

	if err := controller.userService.CheckPasswordDuplicated(password.Password, &userID); err != nil {
		status, resp := helper.DefaultErrorResp(err)
		ctx.JSON(status, resp)
		return
	}

	now := time.Now()
	req := request.UpdateUserRequest{
		Password:  &password.Password,
		UpdatedBy: &userID,
		UpdatedAt: &now,
		Status:    1,
	}
	userData, errQuery := controller.userService.Update(userID, req)
	if errQuery != nil {
		ctx.JSON(http.StatusNotFound, response.DefaultResponse{
			Status:  "fail",
			Message: "ไม่พบข้อมูล User",
			Data:    nil,
		})
		return
	}

	resp := response.DefaultResponse{
		Status:  "success",
		Message: "แก้ไข Password เรียบร้อย",
		Data:    userData,
	}

	ctx.JSON(http.StatusOK, resp)
}

// DeleteUser godoc
// @Summary DeleteUser user
// @Description delete user
// @Tags users
// @Accept json
// @Produce json
// @Param id path string true "User ID (uuid)"
// @Security BearerAuth
// @Success 200 {object} response.DefaultResponse
// @Failure 401 {object} response.DefaultResponse
// @Router /users/{id} [delete]
func (controller *UserController) Delete(ctx *gin.Context) {
	userID, _ := ctx.MustGet("user_id").(uuid.UUID)
	paramId := ctx.Param("id")
	editID, errUuid := uuid.Parse(paramId)
	helper.ErrorPanic(errUuid)
	ctx.Header("Content-Type", "application/json")

	controller.userService.Delete(editID, userID)

	resp := response.DefaultResponse{
		Status:  "success",
		Message: "ลบข้อมูลเรียบร้อย",
		Data:    nil,
	}

	ctx.JSON(http.StatusOK, resp)
}

// UploadAvatar godoc
// @Summary Upload image for user avatar
// @Description upload user avatar file
// @Tags users
// @Accept       multipart/form-data
// @Produce      json
// @Param        file  formData  file    true  "upload avatar file"
// @Security BearerAuth
// @Success 201 {object} response.DefaultResponse
// @Failure 401 {object} response.DefaultResponse
// @Failure 400 {object} response.DefaultResponse
// @Failure 500 {object} response.DefaultResponse
// @Router /users/me/upload-profile [patch]
func (controller *UserController) UploadAvatar(ctx *gin.Context) {
	userID, _ := ctx.MustGet("user_id").(uuid.UUID)

	// get file from key "file"
	file, err := ctx.FormFile("file")
	if err != nil {
		ctx.JSON(http.StatusBadRequest, response.DefaultResponse{Status: "fail", Message: "ไม่พบไฟล์"})
		return
	}

	// file path
	uploadPath, oldFilePath, err := controller.userService.GetAvatarPath(ctx, userID, file)
	if err != nil {
		if appErr, ok := err.(*helper.AppError); ok {
			ctx.JSON(appErr.StatusCode, response.DefaultResponse{
				Status:  "fail",
				Message: appErr.Message,
			})
			return
		}

		// Server Error (500)
		log.Printf("Unexpected Error: %v", err)
		ctx.JSON(http.StatusInternalServerError, response.DefaultResponse{
			Status:  "error",
			Message: "เกิดข้อผิดพลาด",
			Data: gin.H{
				"errors": err.Error(),
			},
		})
		return
	}

	// save file in the disk
	if err := ctx.SaveUploadedFile(file, uploadPath); err != nil {
		ctx.JSON(http.StatusInternalServerError, response.DefaultResponse{
			Status:  "error",
			Message: "เกิดข้อผิดพลาด",
			Data: gin.H{
				"errors": err.Error(),
			},
		})
		return
	}

	// remove old file (if has)
	if oldFilePath != "" {
		err = os.Remove(oldFilePath)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, response.DefaultResponse{
				Status:  "error",
				Message: "เกิดข้อผิดพลาด",
				Data: gin.H{
					"errors": err.Error(),
				},
			})
			return
		}
	}

	updateData := map[string]interface{}{
		model.FieldAvatarPath: &uploadPath,
	}

	if err := controller.userService.PatchUpdate(ctx, userID, updateData); err != nil {
		ctx.JSON(http.StatusInternalServerError, response.DefaultResponse{
			Status:  "error",
			Message: "เกิดข้อผิดพลาด",
			Data: gin.H{
				"errors": err.Error(),
			},
		})
		return
	}

	resp := response.DefaultResponse{
		Status:  "success",
		Message: "อัปโหลดเรียบร้อย",
	}

	ctx.JSON(http.StatusOK, resp)
}

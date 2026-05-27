package helper

import (
	"errors"
	"imaxx-smart-office-be/internal/response"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func ErrorPanic(err error) {
	if err != nil {
		// FK Violation to AppError (403)
		// panic(IDRefError(err))
		panic(err)
	}
}

type AppError struct {
	StatusCode int    `json:"-"`
	Message    string `json:"message"`
	Code       string `json:"code"` // Error Code for Multi-language
}

func (e *AppError) Error() string { // go will see this as error
	return e.Message
}

func NewNotFoundError(msg string) *AppError {
	return &AppError{StatusCode: 404, Message: msg, Code: "RESOURCE_NOT_FOUND"}
}

func NewLogicError(msg string) *AppError {
	return &AppError{StatusCode: 422, Message: msg, Code: "BUSINESS_RULE_VIOLATION"}
}

func NewValidationError(msg string) *AppError {
	return &AppError{StatusCode: 400, Message: msg, Code: "VALIDATION_ERROR"}
}

func NewConflictError(msg string) *AppError {
	return &AppError{StatusCode: 409, Message: msg, Code: "DATA_CONFLICT"}
}

func NewForbiddenError(msg string) *AppError {
	return &AppError{StatusCode: 403, Message: msg, Code: "ACCESS_FORBIDDEN"}
}

func NewUnauthorizedError(msg string) *AppError {
	return &AppError{StatusCode: 401, Message: msg, Code: "UNAUTHORIZED"}
}

func DefaultErrorResp(err error) (int, response.DefaultResponse) {
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return http.StatusNotFound, response.DefaultResponse{
			Status:  "fail",
			Message: "ไม่พบข้อมูล",
		}
	}
	if appErr, ok := err.(*AppError); ok {
		return appErr.StatusCode, response.DefaultResponse{
			Status:  "fail",
			Message: appErr.Message,
		}
	}

	return http.StatusInternalServerError, response.DefaultResponse{
		Status:  "error",
		Message: "เกิดข้อผิดพลาด",
		Data: gin.H{
			"errors": err.Error(),
		},
	}
}

// func IDRefError(err error) error {
// 	var pgErr *pgconn.PgError
// 	if errors.As(err, &pgErr) {
// 		if pgErr.Code == "23503" {
// 			return NewUnauthorizedError("unauthorized: reference user id does not exist")
// 		}
// 	}
// 	return err
// }

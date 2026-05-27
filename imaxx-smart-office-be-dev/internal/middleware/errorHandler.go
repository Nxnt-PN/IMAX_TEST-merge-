package middleware

import (
	"errors"
	"fmt"
	"imaxx-smart-office-be/helper"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgconn"
)

func CustomRecovery() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				// AppError
				if appErr, ok := err.(*helper.AppError); ok {
					c.AbortWithStatusJSON(appErr.StatusCode, appErr)
					return
				}

				// Error ดิบๆ
				if rawErr, ok := err.(error); ok {
					var pgErr *pgconn.PgError
					if errors.As(rawErr, &pgErr) {
						switch pgErr.Code {
						case "23503": // Foreign Key Violation
							unauth := helper.NewUnauthorizedError("Session invalid: record not found")
							c.AbortWithStatusJSON(unauth.StatusCode, unauth)
							return
						case "23505": // Unique Violation (ข้อมูลซ้ำ)
							conflict := helper.NewConflictError("Data already exists (Unique constraint violated)")
							c.AbortWithStatusJSON(conflict.StatusCode, conflict)
							return
						}
					}
				}

				// เคสอื่นๆ (500)
				c.AbortWithStatusJSON(500, gin.H{"error": "Internal Server Error", "detail": fmt.Sprint(err)})
			}
		}()
		c.Next()
	}
}

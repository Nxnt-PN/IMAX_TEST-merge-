package middleware

import (
	"context"
	"fmt"
	"imaxx-smart-office-be/helper"
	"log"
	"net/http"
	"os"

	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

func AuthorizeJWT(db *gorm.DB) gin.HandlerFunc {
	secretKey := os.Getenv("JWT_SECRET")
	return func(c *gin.Context) {

		authHeader := c.GetHeader("Authorization")
		if len(authHeader) > 0 {
			const BEARER_SCHEMA = "Bearer "
			tokenString := authHeader[len(BEARER_SCHEMA):]

			token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
				if _, isvalid := token.Method.(*jwt.SigningMethodHMAC); !isvalid {
					return nil, fmt.Errorf("Invalid token", token.Header["alg"])

				}
				return []byte(secretKey), nil
			})
			if token.Valid {
				claims := token.Claims.(jwt.MapClaims)
				idStr, ok := claims["id"].(string)
				if !ok {
					// type ไม่ถูก
					c.AbortWithStatus(http.StatusUnauthorized)
					return
				}
				userID, err := uuid.Parse(idStr)
				if err != nil {
					c.AbortWithStatusJSON(401, gin.H{"error": "invalid uuid"})
					return
				}

				// non-existance id chk by Select("1")
				var exists int
				err = db.Table("users").Select("1").Where("id = ? AND deleted_at IS NULL", userID).Limit(1).Scan(&exists).Error

				if err != nil || exists != 1 {
					panic(helper.NewUnauthorizedError("user no longer exists or delete"))
					// c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "user no longer exists"})
					// return
				}

				c.Set("user_id", userID)

				// standard context for gorm
				reqCtx := context.WithValue(c.Request.Context(), "current_user_id", userID)
				c.Request = c.Request.WithContext(reqCtx) // update
			} else {
				fmt.Println(err)
				c.AbortWithStatus(http.StatusUnauthorized)
			}
		} else {
			c.AbortWithStatus(http.StatusUnauthorized)
		}
	}
}

func AuthorizeWS(db *gorm.DB) gin.HandlerFunc {
	secretKey := os.Getenv("JWT_SECRET")
	return func(c *gin.Context) {
		// เปลี่ยนจาก c.GetHeader("Authorization") มาเป็น c.Query("token")
		tokenString := c.Query("token")

		if tokenString == "" {
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		// Parse Token
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, isvalid := token.Method.(*jwt.SigningMethodHMAC); !isvalid {
				return nil, fmt.Errorf("Invalid token method: %v", token.Header["alg"])
			}
			return []byte(secretKey), nil
		})

		if err != nil || !token.Valid {
			log.Printf("WS Auth Error: %v", err)
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		claims := token.Claims.(jwt.MapClaims)
		idStr, ok := claims["id"].(string)
		if !ok {
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		userID, err := uuid.Parse(idStr)
		if err != nil {
			c.AbortWithStatusJSON(401, gin.H{"error": "invalid uuid"})
			return
		}

		// ตรวจสอบว่า User ยังมีตัวตนอยู่ไหม
		var exists int
		err = db.Table("users").Select("1").Where("id = ? AND deleted_at IS NULL", userID).Limit(1).Scan(&exists).Error

		if err != nil || exists != 1 {
			// ใช้ท่าเดิม Panic ให้ Recovery Middleware จัดการ
			panic(helper.NewUnauthorizedError("user no longer exists or delete"))
		}

		// เซ็ตค่าลง Context เพื่อให้ Controller เอาไปใช้ต่อได้
		c.Set("user_id", userID)

		// Standard context สำหรับ GORM
		reqCtx := context.WithValue(c.Request.Context(), "current_user_id", userID)
		c.Request = c.Request.WithContext(reqCtx)

		c.Next()
	}
}

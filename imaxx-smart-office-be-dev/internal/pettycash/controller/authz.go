package controller

import (
	"net/http"

	"imaxx-smart-office-be/internal/pettycash/model"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

const (
	PermissionViewPettyCash         = "view_pettycash"
	PermissionCreatePettyCash       = "create_pettycash"
	PermissionEditPettyCash         = "edit_pettycash"
	PermissionDeletePettyCash       = "delete_pettycash"
	PermissionSavePettyCash         = "save_pettycash"
	PermissionSubmitPettyCash       = "submit_pettycash"
	PermissionApprovePettyCash      = "approve_pettycash"
	PermissionRejectPettyCash       = "reject_pettycash"
	PermissionCancelPettyCash       = "cancel_pettycash"
	PermissionResendPettyCash       = "resend_pettycash"
	PermissionViewPettyCashReport   = "view_pettycash_report"
	PermissionExportPettyCashReport = "export_pettycash_report"
	PermissionManagePettyCashMaster = "manage_pettycash_master"
)

func currentJWTUserID(ctx *gin.Context) (uuid.UUID, bool) {
	userIDValue, exists := ctx.Get("user_id")
	if !exists {
		return uuid.Nil, false
	}
	userID, ok := userIDValue.(uuid.UUID)
	return userID, ok
}

func currentUserWithRoles(ctx *gin.Context, db *gorm.DB) (model.User, bool) {
	userID, ok := currentJWTUserID(ctx)
	if !ok {
		return model.User{}, false
	}
	var user model.User
	if err := db.Preload("Roles.Permissions").First(&user, "id = ?", userID).Error; err != nil {
		return model.User{}, false
	}
	return user, true
}

func userHasPermission(user model.User, permissionName string) bool {
	for _, role := range user.Roles {
		for _, permission := range role.Permissions {
			if permission.Name == permissionName {
				return true
			}
		}
	}
	return false
}

func userHasAnyPermission(user model.User, permissionNames ...string) bool {
	for _, permissionName := range permissionNames {
		if userHasPermission(user, permissionName) {
			return true
		}
	}
	return false
}

func RequirePermission(db *gorm.DB, permissionNames ...string) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		user, ok := currentUserWithRoles(ctx, db)
		if !ok {
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}
		if !userHasAnyPermission(user, permissionNames...) {
			abortForbidden(ctx)
			return
		}
		ctx.Next()
	}
}

func requirePettyCashPermission(ctx *gin.Context, db *gorm.DB, permissionNames ...string) (model.User, bool) {
	user, ok := currentUserWithRoles(ctx, db)
	if !ok {
		ctx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return model.User{}, false
	}
	if !userHasAnyPermission(user, permissionNames...) {
		abortForbidden(ctx)
		return model.User{}, false
	}
	return user, true
}

func userHasRole(user model.User, roleName string) bool {
	for _, role := range user.Roles {
		if role.Name == roleName {
			return true
		}
	}
	return false
}

func userHasAnyRole(user model.User, roleNames ...string) bool {
	allowed := map[string]bool{}
	for _, roleName := range roleNames {
		allowed[roleName] = true
	}
	for _, role := range user.Roles {
		if allowed[role.Name] {
			return true
		}
	}
	return false
}

func userHasRoleID(user model.User, roleID uuid.UUID) bool {
	for _, role := range user.Roles {
		if role.ID == roleID {
			return true
		}
	}
	return false
}

func abortForbidden(ctx *gin.Context) {
	ctx.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "Forbidden"})
}

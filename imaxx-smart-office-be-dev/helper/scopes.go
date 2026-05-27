package helper

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// use in my task
func FilterByRoleWithChildren(roleIDs []uuid.UUID) func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		if len(roleIDs) == 0 {
			return db
		}
		// NewDB: true
		userWithChildRoleQuery := db.Session(&gorm.Session{NewDB: true}).
			Table("user_roles").
			Select("DISTINCT(user_roles.user_id)").
			Joins("INNER JOIN parent_child_roles pcr ON pcr.child_role_id = user_roles.role_id").
			Where("pcr.parent_role_id IN ? OR user_roles.role_id IN ?", roleIDs, roleIDs)

		return db.Where("(role_id IN ? AND user_id IN (?))", roleIDs, userWithChildRoleQuery)
	}
}

func FilterByChildrenRows(roleIDs []uuid.UUID) func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		if len(roleIDs) == 0 {
			return db
		}
		// NewDB: true
		userWithChildRoleQuery := db.Session(&gorm.Session{NewDB: true}).
			Table("user_roles").
			Select("DISTINCT(user_roles.user_id)").
			Joins("INNER JOIN parent_child_roles pcr ON pcr.child_role_id = user_roles.role_id").
			Where("pcr.parent_role_id IN ?", roleIDs)

		return db.Where("user_id IN (?)", userWithChildRoleQuery)
	}
}

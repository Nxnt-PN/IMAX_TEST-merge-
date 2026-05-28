package model

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	BaseModel  `gorm:"embedded"`
	Username   string     `json:"username" gorm:"column:username;type:varchar(255);not null"`
	Password   string     `json:"-" gorm:"column:password;type:varchar(255);not null"`
	FirstName  string     `json:"first_name" gorm:"column:first_name;type:varchar(255);not null"`
	LastName   string     `json:"last_name" gorm:"column:last_name;type:varchar(255);not null"`
	Email      string     `json:"email" gorm:"column:email;type:varchar(255);not null"`
	EmployedAt time.Time  `json:"employed_at" gorm:"column:employed_at;type:timestamp;not null"`
	LocationID *uuid.UUID `json:"location_id" gorm:"column:location_id;type:uuid"`
	AvatarPath *string    `json:"avatar_path" gorm:"column:avatar_path;type:varchar(500)"`
	Status     int        `json:"status" gorm:"column:status;type:int;not null"`

	Location *Location `json:"location" gorm:"foreignKey:LocationID;references:ID"`
	Roles    []Role    `json:"roles" gorm:"many2many:user_roles;" copier:"-"`
}

const (
	FieldAvatarPath = "avatar_path"
)

// func (u *User) BeforeQuery(db *gorm.DB) error {
// 	userID := db.Statement.Context.Value("current_user_id")

// 	if userID != nil {
// 		return db.Where("id = ?", userID).Error
// 	}
// 	return nil
// }

package model

type Permission struct {
	BaseModel `gorm:"embedded"`
	Name      string `json:"name" gorm:"column:name;type:varchar(255);not null"`
	Status    int    `json:"status" gorm:"column:status;default:1;type:int;not null"` //1=active,0=inactive

	Roles []Role `json:"-" gorm:"many2many:role_permissions;"`
}

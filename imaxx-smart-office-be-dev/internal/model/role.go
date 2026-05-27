package model

type Role struct {
	BaseModel `gorm:"embedded"`
	Name      string `json:"name" gorm:"column:name;type:varchar(255);not null"`
	Status    int    `json:"status" gorm:"column:status;type:int;not null"` //1=active,0=inactive

	Users       []User       `json:"-" gorm:"many2many:user_roles;"`
	Permissions []Permission `json:"permissions" gorm:"many2many:role_permissions;"`
	ChildRoles  []*Role      `json:"child_roles" gorm:"many2many:parent_child_roles;joinForeignKey:ParentRoleID;joinReferences:ChildRoleID"`
}

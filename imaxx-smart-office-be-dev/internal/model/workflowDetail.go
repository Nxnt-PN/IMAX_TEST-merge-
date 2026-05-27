package model

import "github.com/google/uuid"

type WorkflowDetail struct {
	BaseModel  `gorm:"embedded"`
	WorkflowID uuid.UUID `json:"workflow_id" gorm:"type:uuid;not null"`
	RoleID     uuid.UUID `json:"role_id" gorm:"type:uuid;not null"`

	Name  string `json:"name" gorm:"column:name;type:varchar(255);not null"`
	Seq   int    `json:"seq" gorm:"column:seq;type:int;not null"`
	State int    `json:"state" gorm:"column:state;type:int;not null"`

	IsFinal int `json:"is_final" gorm:"column:is_final;type:int;not null"` //0=not final,1=final
	Status  int `json:"status" gorm:"column:status;type:int;not null"`     //1=active,0=inactive

	Workflow Workflow `json:"-" gorm:"foreignKey:WorkflowID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" copier:"-"`
	Role     Role     `json:"role" gorm:"foreignKey:RoleID"`
}

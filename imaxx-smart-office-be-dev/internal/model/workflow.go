package model

type Workflow struct {
	BaseModel `gorm:"embedded"`
	Name      string `json:"name" gorm:"column:name;type:varchar(255);not null"`
	Status    int    `json:"status" gorm:"column:status;type:int;not null"` //1=active,0=inactive

	WorkflowDetails []WorkflowDetail `json:"workflow_details" gorm:"foreignKey:WorkflowID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Systems         []System         `json:"systems" gorm:"foreignKey:WorkflowID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
}

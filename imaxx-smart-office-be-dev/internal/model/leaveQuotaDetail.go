package model

import "github.com/google/uuid"

type LeaveQuotaDetail struct {
	BaseModel    `gorm:"embedded"`
	LeaveQuotaID uuid.UUID `json:"leave_quota_id" gorm:"type:uuid;not null"`

	WorkYearMin  float64 `json:"work_year_min" gorm:"column:work_year_min;type:numeric;not null"`
	WorkYearMax  float64 `json:"work_year_max" gorm:"column:work_year_max;type:numeric;not null"`
	AbsenceQuota int     `json:"absence_quota" gorm:"column:absence_quota;type:int;not null"`
	AnnualQuota  int     `json:"annual_quota" gorm:"column:annual_quota;type:int;not null"`
	SickQuota    int     `json:"sick_quota" gorm:"column:sick_quota;type:int;not null"`
	OtherQuota   int     `json:"other_quota" gorm:"column:other_quota;type:int;not null"`
	Status       int     `json:"status" gorm:"column:status;type:int;not null"` //1=active,0=inactive

	LeaveQuota LeaveQuota `json:"-" gorm:"foreignKey:LeaveQuotaID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" copier:"-"`
}

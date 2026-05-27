package model

type LeaveQuota struct {
	BaseModel `gorm:"embedded"`
	Year      int `json:"year" gorm:"column:year;type:int;not null"`
	Status    int `json:"status" gorm:"column:status;type:int;not null"` //1=active,0=inactive

	LeaveQuotaDetails []LeaveQuotaDetail `json:"leave_quota_details" gorm:"foreignKey:LeaveQuotaID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
}

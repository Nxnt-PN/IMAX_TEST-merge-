package model

type Location struct {
	BaseModel    `gorm:"embedded"`
	LocationName string `json:"location_name" gorm:"column:location_name;type:varchar(100);not null"`
	Status       int    `json:"status" gorm:"column:status;type:int;not null;default:1"`

	Users []User `json:"-" gorm:"foreignKey:LocationID"`
}

package seed

import (
	"errors"
	"imaxx-smart-office-be/internal/model"
	"log"
	"time"

	"gorm.io/gorm"
)

func SeedLeaveQuota(db *gorm.DB) {
	// seed current year
	var lastQuota model.LeaveQuota
	var targetYear int = time.Now().Year()

	err := db.Where("year = ?", targetYear).First(&lastQuota).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			//LeaveQuota
			leaveQuota := model.LeaveQuota{
				BaseModel: model.BaseModel{
					CreatedAt: time.Now(),
				},
				Year:   targetYear,
				Status: 1,
				LeaveQuotaDetails: []model.LeaveQuotaDetail{
					{
						WorkYearMin:  0,
						WorkYearMax:  2,
						AbsenceQuota: 3,
						AnnualQuota:  6,
						SickQuota:    30,
						OtherQuota:   120,
						Status:       1,
					},
					{
						WorkYearMin:  2,
						WorkYearMax:  9999,
						AbsenceQuota: 3,
						AnnualQuota:  10,
						SickQuota:    30,
						OtherQuota:   120,
						Status:       1,
					},
				},
			}

			// save to database (gorm will insert leaveQuota and details)
			if err := db.Create(&leaveQuota).Error; err != nil {
				log.Printf("Could not seed leave quota: %v", err)
			}
		}
	}

}

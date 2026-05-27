package seed

import (
	"imaxx-smart-office-be/enums"
	"imaxx-smart-office-be/internal/model"
	"log"
	"time"

	"gorm.io/gorm"
)

func SeedWorkflow(db *gorm.DB) {
	//workflow
	var chkWorkflow int64
	db.Model(&model.Workflow{}).
		Where("name = ?", "Leave System Workflow").Count(&chkWorkflow)
	if chkWorkflow == 0 {
		//find role
		var hrRole, managerRole model.Role
		if err := db.Where("name = ?", "Human Resource").First(&hrRole).Error; err != nil {
			log.Println("HR role not found, skipping workflow seed")
			return
		}
		if err := db.Where("name = ?", "Manager").First(&managerRole).Error; err != nil {
			log.Println("Manager role not found, skipping workflow seed")
			return
		}
		workflow := model.Workflow{
			BaseModel: model.BaseModel{
				CreatedAt: time.Now(),
			},
			Name:   "Leave System Workflow",
			Status: 1,
			WorkflowDetails: []model.WorkflowDetail{
				{
					Name:    "Waiting for Manager Approve",
					Seq:     1,
					State:   2,
					RoleID:  *managerRole.ID,
					IsFinal: 0,
					Status:  1,
				},
				{
					Name:    "Waiting for HR Approve",
					Seq:     2,
					State:   3,
					RoleID:  *hrRole.ID,
					IsFinal: 1,
					Status:  1,
				},
			},
		}

		// save to database (gorm will insert workflow and details)
		if err := db.Create(&workflow).Error; err != nil {
			log.Printf("Could not seed workflow: %v", err)
		}
	}
	var leaveWorkflow model.Workflow
	db.Where("name = ? ", "Leave System Workflow").First(&leaveWorkflow)

	//System
	var chkSystem int64
	db.Model(&model.System{}).
		Where("name = ?", "Leave System").Count(&chkSystem)
	if chkSystem == 0 {
		system := model.System{
			BaseModel: model.BaseModel{
				CreatedAt: time.Now(),
			},
			Slug:       string(enums.LeaveSystemSlug),
			Name:       "Leave System",
			Status:     1,
			WorkflowID: *leaveWorkflow.ID,
		}

		if err := db.Create(&system).Error; err != nil {
			log.Printf("Could not seed system: %v", err)
		}
	} else {
		var system model.System
		db.Model(&system).Where("name = ? ", "Leave System").Updates(map[string]interface{}{
			"slug": string(enums.LeaveSystemSlug),
			"name": "Leave System",
		})
	}
}

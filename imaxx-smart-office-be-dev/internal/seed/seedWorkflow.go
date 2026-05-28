package seed

import (
	"imaxx-smart-office-be/enums"
	"imaxx-smart-office-be/internal/model"
	pettyModel "imaxx-smart-office-be/internal/pettycash/model"
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

	var chkPettyCashWorkflow int64
	db.Model(&model.Workflow{}).
		Where("name = ?", "Petty Cash Workflow").Count(&chkPettyCashWorkflow)
	var financeRole model.Role
	if err := db.Where("name = ?", "Finance").First(&financeRole).Error; err != nil {
		log.Println("Finance role not found, skipping petty cash workflow seed")
		return
	}
	if chkPettyCashWorkflow == 0 {
		workflow := model.Workflow{
			BaseModel: model.BaseModel{
				CreatedAt: time.Now(),
			},
			Name:   "Petty Cash Workflow",
			Status: 1,
			WorkflowDetails: []model.WorkflowDetail{
				{
					Name:    "Waiting for Finance Approve",
					Seq:     1,
					State:   2,
					RoleID:  *financeRole.ID,
					IsFinal: 1,
					Status:  1,
				},
			},
		}

		if err := db.Create(&workflow).Error; err != nil {
			log.Printf("Could not seed petty cash workflow: %v", err)
		}
	}
	var pettyCashWorkflow model.Workflow
	db.Where("name = ? ", "Petty Cash Workflow").First(&pettyCashWorkflow)
	if pettyCashWorkflow.ID != nil {
		var detail model.WorkflowDetail
		err := db.Where("workflow_id = ? AND seq = ?", pettyCashWorkflow.ID, 1).First(&detail).Error
		if err == nil {
			db.Model(&detail).Updates(map[string]interface{}{
				"name":     "Waiting for Finance Approve",
				"role_id":  *financeRole.ID,
				"state":    2,
				"is_final": 1,
				"status":   1,
			})
		} else {
			db.Create(&model.WorkflowDetail{
				BaseModel: model.BaseModel{
					CreatedAt: time.Now(),
				},
				WorkflowID: *pettyCashWorkflow.ID,
				Name:       "Waiting for Finance Approve",
				Seq:        1,
				State:      2,
				RoleID:     *financeRole.ID,
				IsFinal:    1,
				Status:     1,
			})
		}
		db.Model(&pettyModel.PettyCashForm{}).Where("state = ?", 2).Updates(map[string]interface{}{
			"role_id":      *financeRole.ID,
			"state_detail": "Waiting for Finance",
		})
	}

	var chkPettyCashSystem int64
	db.Model(&model.System{}).
		Where("slug = ?", string(enums.PettyCashSystemSlug)).Count(&chkPettyCashSystem)
	if chkPettyCashSystem == 0 && pettyCashWorkflow.ID != nil {
		system := model.System{
			BaseModel: model.BaseModel{
				CreatedAt: time.Now(),
			},
			Slug:       string(enums.PettyCashSystemSlug),
			Name:       "Petty Cash",
			Status:     1,
			WorkflowID: *pettyCashWorkflow.ID,
		}

		if err := db.Create(&system).Error; err != nil {
			log.Printf("Could not seed petty cash system: %v", err)
		}
	} else if pettyCashWorkflow.ID != nil {
		var system model.System
		db.Model(&system).Where("slug = ? ", string(enums.PettyCashSystemSlug)).Updates(map[string]interface{}{
			"slug":        string(enums.PettyCashSystemSlug),
			"name":        "Petty Cash",
			"workflow_id": *pettyCashWorkflow.ID,
		})
	}
}

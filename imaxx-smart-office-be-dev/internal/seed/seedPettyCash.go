package seed

import (
	"log"
	"time"

	pettyModel "imaxx-smart-office-be/internal/pettycash/model"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

func SeedPettyCash(db *gorm.DB) {
	var admin pettyModel.User
	if err := db.Where("username = ?", "admin").First(&admin).Error; err != nil {
		log.Println("Admin user not found, skipping petty cash seed")
		return
	}

	var system pettyModel.System
	if err := db.Preload("Workflow").Where("slug = ?", "petty-cash").First(&system).Error; err != nil {
		log.Println("Petty Cash system not found, skipping petty cash seed")
		return
	}

	projects := seedPettyCashProjects(db, admin.ID)
	reasons := seedPettyCashReasons(db, admin.ID, system.ID)
	if len(projects) == 0 || len(reasons) == 0 {
		log.Println("Petty Cash master data incomplete, skipping petty cash form seed")
		return
	}

	var financeRole pettyModel.Role
	if err := db.Where("name = ?", "Finance").First(&financeRole).Error; err != nil {
		log.Println("Finance role not found, skipping submitted petty cash form seed")
	}

	seedPettyCashForm(db, pettyCashSeedForm{
		DocumentNo:  "PC-SEED-0001",
		Title:       "Office pantry replenishment",
		State:       1,
		StateDetail: "Draft",
		Note:        "Draft sample for create/edit testing",
		UserID:      admin.ID,
		WorkflowID:  system.WorkflowID,
		ProjectID:   projects[0].ID,
		ReasonID:    reasons[0].ID,
		Total:       1250,
		CreatedAt:   time.Now().AddDate(0, 0, -5),
	})

	if financeRole.ID != uuid.Nil {
		seedPettyCashForm(db, pettyCashSeedForm{
			DocumentNo:  "PC-SEED-0002",
			Title:       "Client meeting travel expense",
			State:       2,
			StateDetail: "Waiting for Finance",
			Note:        "Pending approval sample for my-tasks testing",
			UserID:      admin.ID,
			WorkflowID:  system.WorkflowID,
			RoleID:      financeRole.ID,
			ProjectID:   projects[1%len(projects)].ID,
			ReasonID:    reasons[1%len(reasons)].ID,
			Total:       3400,
			CreatedAt:   time.Now().AddDate(0, 0, -3),
		})
	}

	seedPettyCashForm(db, pettyCashSeedForm{
		DocumentNo:  "PC-SEED-0003",
		Title:       "Emergency office supplies",
		State:       3,
		StateDetail: "Completed",
		Note:        "Completed sample for summary testing",
		UserID:      admin.ID,
		WorkflowID:  system.WorkflowID,
		ProjectID:   projects[2%len(projects)].ID,
		ReasonID:    reasons[2%len(reasons)].ID,
		Total:       2890,
		CreatedAt:   time.Now().AddDate(0, 0, -1),
	})
}

func seedPettyCashProjects(db *gorm.DB, adminID uuid.UUID) []pettyModel.Project {
	rows := []pettyModel.Project{
		{ProjectName: "Head Office", Description: "General office expenses", Status: 1, CreatedBy: &adminID},
		{ProjectName: "Client Success", Description: "Customer visit and support expenses", Status: 1, CreatedBy: &adminID},
		{ProjectName: "IT Operations", Description: "Small equipment and operational expenses", Status: 1, CreatedBy: &adminID},
	}

	for _, row := range rows {
		var project pettyModel.Project
		err := db.Where("project_name = ?", row.ProjectName).
			Assign(row).
			FirstOrCreate(&project).Error
		if err != nil {
			log.Printf("Could not seed petty cash project %s: %v", row.ProjectName, err)
		}
	}

	var projects []pettyModel.Project
	db.Order("project_name asc").Find(&projects)
	return projects
}

func seedPettyCashReasons(db *gorm.DB, adminID uuid.UUID, systemID uuid.UUID) []pettyModel.Reason {
	rows := []pettyModel.Reason{
		{SystemID: &systemID, ReasonName: "Office Supplies", Description: "Stationery and small office supplies", Status: 1, CreatedBy: &adminID},
		{SystemID: &systemID, ReasonName: "Travel", Description: "Taxi, fuel, parking, and local travel", Status: 1, CreatedBy: &adminID},
		{SystemID: &systemID, ReasonName: "Meals", Description: "Meeting meals and refreshments", Status: 1, CreatedBy: &adminID},
	}

	for _, row := range rows {
		var reason pettyModel.Reason
		err := db.Where("reason_name = ? AND system_id = ?", row.ReasonName, systemID).
			Assign(row).
			FirstOrCreate(&reason).Error
		if err != nil {
			log.Printf("Could not seed petty cash reason %s: %v", row.ReasonName, err)
		}
	}

	var reasons []pettyModel.Reason
	db.Where("system_id = ?", systemID).Order("reason_name asc").Find(&reasons)
	return reasons
}

type pettyCashSeedForm struct {
	DocumentNo  string
	Title       string
	State       int
	StateDetail string
	Note        string
	UserID      uuid.UUID
	WorkflowID  uuid.UUID
	RoleID      uuid.UUID
	ProjectID   uuid.UUID
	ReasonID    uuid.UUID
	Total       int
	CreatedAt   time.Time
}

func seedPettyCashForm(db *gorm.DB, input pettyCashSeedForm) {
	var count int64
	db.Model(&pettyModel.PettyCashForm{}).Where("document_no = ?", input.DocumentNo).Count(&count)
	if count > 0 {
		return
	}

	form := pettyModel.PettyCashForm{
		UserID:      input.UserID,
		WorkflowID:  input.WorkflowID,
		DocumentNo:  input.DocumentNo,
		Title:       input.Title,
		State:       input.State,
		StateDetail: input.StateDetail,
		RoleID:      input.RoleID,
		TotalAmount: input.Total,
		Note:        input.Note,
		CreatedBy:   &input.UserID,
		CreatedAt:   input.CreatedAt,
		Items: []pettyModel.PettyCashFormItem{
			{
				ProjectID:   input.ProjectID,
				ReasonID:    input.ReasonID,
				Date:        input.CreatedAt,
				Description: input.Title,
				Note:        input.Note,
				Total:       input.Total,
				CreatedAt:   input.CreatedAt,
			},
		},
		History: []pettyModel.PettyCashHistory{
			{
				UserID:    &input.UserID,
				Action:    "Created",
				Remark:    "Seed data",
				State:     1,
				CreatedAt: input.CreatedAt,
			},
		},
	}

	if input.State != 1 {
		form.History = append(form.History, pettyModel.PettyCashHistory{
			UserID:    &input.UserID,
			Action:    "Submitted",
			Remark:    "Seed data",
			State:     input.State,
			CreatedAt: input.CreatedAt.Add(15 * time.Minute),
		})
	}

	if input.State == 3 {
		form.History = append(form.History, pettyModel.PettyCashHistory{
			UserID:    &input.UserID,
			Action:    "Approved",
			Remark:    "Seed data",
			State:     input.State,
			CreatedAt: input.CreatedAt.Add(30 * time.Minute),
		})
	}

	query := db
	if input.RoleID == uuid.Nil {
		query = query.Omit("RoleID")
	}

	if err := query.Create(&form).Error; err != nil {
		log.Printf("Could not seed petty cash form %s: %v", input.DocumentNo, err)
	}
}

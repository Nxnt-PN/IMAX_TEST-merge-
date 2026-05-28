package seed

import (
	"log"
	"time"

	"gorm.io/gorm"
)

type pettyCashSeedRef struct {
	ID string `gorm:"column:id"`
}

func SeedPettyCash(db *gorm.DB) {
	var admin pettyCashSeedRef
	if err := db.Table("users").Select("id").Where("username = ?", "admin").Scan(&admin).Error; err != nil || admin.ID == "" {
		log.Println("Admin user not found, skipping petty cash seed")
		return
	}

	var system pettyCashSeedRef
	if err := db.Table("systems").Select("id").Where("slug = ?", "petty-cash").Scan(&system).Error; err != nil || system.ID == "" {
		log.Println("Petty Cash system not found, skipping petty cash seed")
		return
	}

	seedPettyCashProjects(db, admin.ID)
	seedPettyCashReasons(db, admin.ID, system.ID)
}

func seedPettyCashProjects(db *gorm.DB, adminID string) {
	now := time.Now()
	rows := []struct {
		Name        string
		Description string
	}{
		{Name: "Head Office", Description: "General office expenses"},
		{Name: "Client Success", Description: "Customer visit and support expenses"},
		{Name: "IT Operations", Description: "Small equipment and operational expenses"},
	}

	for _, row := range rows {
		if err := db.Exec(`
			INSERT INTO petty_cash_projects (project_name, description, status, created_by, created_at)
			SELECT ?, ?, 1, ?::uuid, ?
			WHERE NOT EXISTS (
				SELECT 1 FROM petty_cash_projects WHERE project_name = ? AND deleted_at IS NULL
			)
		`, row.Name, row.Description, adminID, now, row.Name).Error; err != nil {
			log.Printf("Could not seed petty cash project %s: %v", row.Name, err)
		}
	}
}

func seedPettyCashReasons(db *gorm.DB, adminID string, systemID string) {
	now := time.Now()
	rows := []struct {
		Name        string
		Description string
	}{
		{Name: "Office Supplies", Description: "Stationery and small office supplies"},
		{Name: "Travel", Description: "Taxi, fuel, parking, and local travel"},
		{Name: "Meals", Description: "Meeting meals and refreshments"},
	}

	for _, row := range rows {
		if err := db.Exec(`
			INSERT INTO petty_cash_reasons (system_id, reason_name, description, status, created_by, created_at)
			SELECT ?::uuid, ?, ?, 1, ?::uuid, ?
			WHERE NOT EXISTS (
				SELECT 1 FROM petty_cash_reasons WHERE system_id = ?::uuid AND reason_name = ? AND deleted_at IS NULL
			)
		`, systemID, row.Name, row.Description, adminID, now, systemID, row.Name).Error; err != nil {
			log.Printf("Could not seed petty cash reason %s: %v", row.Name, err)
		}
	}
}

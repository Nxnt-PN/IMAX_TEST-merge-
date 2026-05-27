package helper

import (
	"fmt"
	"imaxx-smart-office-be/internal/response"
	"strings"
	"time"

	"github.com/google/uuid"
)

type UserFilter struct {
	ID          *uuid.UUID
	Username    *string
	FirstName   *string
	LastName    *string
	Email       *string
	EmployedAt  *time.Time
	RoleID      *uuid.UUID `gorm:"-"` // skip WHERE
	IsActive    *bool      `gorm:"column:status"`
	ChildUserID *uuid.UUID `gorm:"-"` // skip WHERE
}

type IDOnly struct {
	ID *uuid.UUID `gorm:"column:id"`
}

type UserMailNoti struct {
	ID        *uuid.UUID `gorm:"column:id"`
	FirstName *string
	LastName  *string
	Email     *string
}

type NameOnly struct {
	FirstName *string `gorm:"column:first_name"`
	LastName  *string `gorm:"column:last_name"`
}

type StaffInfo struct {
	ID         *uuid.UUID `gorm:"column:id"`
	FirstName  *string
	LastName   *string
	EmployedAt *time.Time
}

func CalculateTenure(startDate time.Time) response.Tenure {
	now := time.Now()

	// เป็นค่าว่าง หรือเป็นอนาคต
	if startDate.IsZero() || startDate.After(now) {
		return response.Tenure{
			DisplayText: "0 เดือน",
		}
	}

	y1, m1, d1 := startDate.Date()
	y2, m2, d2 := now.Date()

	years := y2 - y1
	months := int(m2 - m1)
	days := d2 - d1

	// ยืมเดือน
	if days < 0 {
		months--
		t := time.Date(y2, m2, 0, 0, 0, 0, 0, time.UTC)
		days += t.Day()
	}

	// ยืมปี
	if months < 0 {
		years--
		months += 12
	}

	totalMonths := (years * 12) + months

	// Display Text
	var displayParts []string

	if years > 0 {
		// if years == 1 {
		// 	displayParts = append(displayParts, "1 Year")
		// } else {
		// 	displayParts = append(displayParts, fmt.Sprintf("%d Years", years))
		// }
		displayParts = append(displayParts, fmt.Sprintf("%d ปี", years))
	}

	if months > 0 {
		// if months == 1 {
		// 	displayParts = append(displayParts, "1 Month")
		// } else {
		// 	displayParts = append(displayParts, fmt.Sprintf("%d Months", months))
		// }
		displayParts = append(displayParts, fmt.Sprintf("%d เดือน", months))
	}

	// ไม่ถึง 1 เดือน
	if years == 0 && months == 0 {
		// if days == 1 {
		// 	displayParts = append(displayParts, "1 Day")
		// } else if days > 1 {
		// 	displayParts = append(displayParts, fmt.Sprintf("%d Days", days))
		if days > 0 {
			displayParts = append(displayParts, fmt.Sprintf("%d วัน", days))
		} else {
			displayParts = append(displayParts, "0 เดือน") // วันแรก
		}
	}

	displayText := strings.Join(displayParts, " ")

	return response.Tenure{
		Years:       years,
		Months:      months,
		Days:        days,
		TotalMonths: totalMonths,
		DisplayText: displayText,
	}
}

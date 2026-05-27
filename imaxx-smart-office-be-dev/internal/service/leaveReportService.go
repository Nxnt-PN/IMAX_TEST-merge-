package service

import (
	"fmt"
	"imaxx-smart-office-be/enums"
	"imaxx-smart-office-be/helper"
	"imaxx-smart-office-be/internal/model"
	"imaxx-smart-office-be/internal/repository"
	"imaxx-smart-office-be/internal/response"
	"time"

	"github.com/xuri/excelize/v2"
)

type LeaveReportService interface {
	GetStaffReport(pagination helper.Pagination) (*helper.Pagination, error)
	ExportStuffReportExcel(pagination helper.Pagination) (*excelize.File, error)
}

type LeaveReportServiceImpl struct {
	LeaveFormRepository repository.LeaveFormRepository
	UserRepository      repository.UserRepository
}

func NewLeaveReportServiceImpl(
	leaveFormRepository repository.LeaveFormRepository,
	userRepository repository.UserRepository,

) LeaveReportService {
	return &LeaveReportServiceImpl{
		LeaveFormRepository: leaveFormRepository,
		UserRepository:      userRepository,
	}
}

func reportQuery(keyword string) (string, []interface{}) {
	var filters []interface{}
	var whereText string = ""
	if keyword != "" {
		whereText += `username ILIKE ? OR
		first_name ILIKE ? OR
		last_name ILIKE ? OR
		CONCAT(first_name, ' ', last_name) ILIKE ?`
		filters = append(filters, "%"+keyword+"%")
		filters = append(filters, "%"+keyword+"%")
		filters = append(filters, "%"+keyword+"%")
		filters = append(filters, "%"+keyword+"%")

		if hasLocation := helper.LocationToRoleNames(keyword); hasLocation != nil {
			// case ยังเอาชื่อมาใช้
			// whereText += `OR EXISTS (
			// 	SELECT 1 FROM user_roles ur
			// 	INNER JOIN roles r ON r.id = ur.role_id
			// 	WHERE ur.user_id = users.id AND r.name IN (?))`

			// filters = append(filters, hasLocation)

			// case ไม่เอาชื่อเลย
			whereText = `EXISTS (
				SELECT 1 FROM user_roles ur
				INNER JOIN roles r ON r.id = ur.role_id
				WHERE ur.user_id = users.id AND r.name IN (?))`
			return whereText, []interface{}{hasLocation}
		}
	}
	return whereText, filters
}

func (l *LeaveReportServiceImpl) getStaffReportResponse(users []model.User, year int) ([]response.StaffReportLeave, error) {
	staffResp := make([]response.StaffReportLeave, 0, len(users))
	for _, user := range users {
		//find leave cum
		total := make(map[enums.LeaveType]float64)
		for _, lt := range enums.AllLeaveTypes {
			res, err := l.LeaveFormRepository.FindUserDaysLeaveCum(*user.ID, lt.String(), year, []int{int(enums.StateComplete)})
			if err != nil {
				return nil, err
			}
			total[lt] = res
		}
		// get role names
		roleNames := make([]string, len(user.Roles))
		for _, role := range user.Roles {
			roleNames = append(roleNames, role.Name)
		}

		// response
		staffResp = append(staffResp, response.StaffReportLeave{
			ID:       *user.ID,
			Username: user.Username,
			FullName: user.FirstName + " " + user.LastName,
			Absence:  total[enums.LeaveAbsence],
			Sick:     total[enums.LeaveSick],
			Annual:   total[enums.LeaveAnnual],
			Other:    total[enums.LeaveOther],
			Tenure:   helper.CalculateTenure(user.EmployedAt),
			Location: helper.LocationRoles(roleNames),
			Avatar:   user.AvatarPath,
		})
	}
	return staffResp, nil
}

func (l *LeaveReportServiceImpl) GetStaffReport(pagination helper.Pagination) (*helper.Pagination, error) {
	// this year
	year := time.Now().Year()

	// query user
	whereText, filters := reportQuery(pagination.Keyword)
	result := l.UserRepository.FindAll(pagination, whereText, filters)

	userRows, ok := result.Rows.([]model.User)
	if !ok {
		result.Rows = []response.StaffReportLeave{} // slice เปล่า หรือ error
		return result, nil
	}

	stuffResp, err := l.getStaffReportResponse(userRows, year)
	if err != nil {
		return nil, err
	}
	result.Rows = stuffResp

	return result, nil
}

func (l *LeaveReportServiceImpl) ExportStuffReportExcel(pagination helper.Pagination) (*excelize.File, error) {
	// this year
	year := time.Now().Year()

	// query user
	whereText, filters := reportQuery(pagination.Keyword)
	result := l.UserRepository.FindAllRaw(pagination, whereText, filters)

	stuffReport, err := l.getStaffReportResponse(result, year)
	if err != nil {
		return nil, err
	}

	f := excelize.NewFile()
	sheet := "Sheet1"
	// f.SetSheetName("Sheet1", sheet)

	// สร้าง Header
	headers := []string{"No.", "Name", "ลาป่วย", "ลาพักร้อน", "ลากิจ", "ลาอื่นๆ", "อายุงาน", "Location"}
	for i, h := range headers {
		cell, _ := excelize.CoordinatesToCellName(i+1, 1)
		f.SetCellValue(sheet, cell, h)
	}

	// ใส่ข้อมูล
	for i, row := range stuffReport {
		f.SetCellValue(sheet, fmt.Sprintf("A%d", i+2), i+1)
		f.SetCellValue(sheet, fmt.Sprintf("B%d", i+2), row.FullName)
		f.SetCellValue(sheet, fmt.Sprintf("C%d", i+2), row.Sick)
		f.SetCellValue(sheet, fmt.Sprintf("D%d", i+2), row.Annual)
		f.SetCellValue(sheet, fmt.Sprintf("E%d", i+2), row.Absence)
		f.SetCellValue(sheet, fmt.Sprintf("F%d", i+2), row.Other)
		f.SetCellValue(sheet, fmt.Sprintf("G%d", i+2), row.Tenure.DisplayText)
		f.SetCellValue(sheet, fmt.Sprintf("H%d", i+2), row.Location)
	}

	return f, nil
}

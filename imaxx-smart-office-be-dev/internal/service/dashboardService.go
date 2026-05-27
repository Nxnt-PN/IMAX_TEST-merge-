package service

import (
	"imaxx-smart-office-be/enums"
	"imaxx-smart-office-be/helper"
	"imaxx-smart-office-be/internal/repository"
	"imaxx-smart-office-be/internal/response"
	"log"
	"time"

	"github.com/google/uuid"
)

type DashboardService interface {
	GroupingCount(userID uuid.UUID) (*response.LeaveGroupingCount, error)
	GetMyCalendar(userID uuid.UUID) ([]response.UserCalendar, error)
	GetChildrenCalendar(userID uuid.UUID) ([]response.UserCalendar, error)
}

type DashboardServiceImpl struct {
	// DashboardRepository repository.DashboardRepository
	LeaveFormRepository  repository.LeaveFormRepository
	LeaveQuotaRepository repository.LeaveQuotaRepository
	UserRepository       repository.UserRepository
}

func NewDashboardServiceImpl(
	// dashboardRepository repository.DashboardRepository,
	leaveFormRepository repository.LeaveFormRepository,
	leaveQuotaRepository repository.LeaveQuotaRepository,
	userRepository repository.UserRepository,
) DashboardService {
	return &DashboardServiceImpl{
		LeaveFormRepository:  leaveFormRepository,
		LeaveQuotaRepository: leaveQuotaRepository,
		UserRepository:       userRepository,
	}
}

func (d *DashboardServiceImpl) GroupingCount(userID uuid.UUID) (*response.LeaveGroupingCount, error) {
	// this year
	year := time.Now().Year()

	results := make(map[enums.LeaveType]*response.LeaveCountValue)

	for _, lt := range enums.AllLeaveTypes {
		res, err := d.leaveAndQuota(userID, lt, year)
		if err != nil {
			return nil, err
		}
		results[lt] = res
	}

	resp := response.LeaveGroupingCount{
		Absence: *results[enums.LeaveAbsence],
		Sick:    *results[enums.LeaveSick],
		Annual:  *results[enums.LeaveAnnual],
		Other:   *results[enums.LeaveOther],
	}

	return &resp, nil

}

func (d *DashboardServiceImpl) leaveAndQuota(userID uuid.UUID, leaveType enums.LeaveType, year int) (*response.LeaveCountValue, error) {
	leaveCum, err := d.LeaveFormRepository.FindUserDaysLeaveCum(userID, leaveType.String(), year, []int{int(enums.StateComplete)})
	if err != nil {
		return nil, err
	}
	quota, err := d.LeaveQuotaRepository.FindUserLeaveQuota(userID, leaveType, year)
	if err != nil {
		return nil, err
	}

	resp := response.LeaveCountValue{
		Use:   leaveCum,
		Quota: quota,
	}

	return &resp, nil
}

func (d *DashboardServiceImpl) GetMyCalendar(userID uuid.UUID) ([]response.UserCalendar, error) {
	leaves, err := d.LeaveFormRepository.FindByFilter("user_id = ? AND state = ?", []interface{}{userID, enums.StateComplete})
	if err != nil {
		return nil, err
	}

	resp := make([]response.UserCalendar, len(leaves))
	for i, leave := range leaves {
		resp[i] = response.UserCalendar{
			ID:        *leave.ID,
			Type:      string(leave.LeaveType),
			Reason:    leave.Reason,
			StartDate: leave.StartDate,
			EndDate:   leave.EndDate,
		}
	}

	return resp, nil
}

func (d *DashboardServiceImpl) GetChildrenCalendar(userID uuid.UUID) ([]response.UserCalendar, error) {
	roleIDs, err := d.UserRepository.GetUserRoleIDs(userID)
	if err != nil {
		log.Printf("error finding users: %v", err)
		return nil, helper.NewNotFoundError("ไม่เจอผู้ใช้")
	}

	leaves, err := d.LeaveFormRepository.FindByFilter("state = ?", []interface{}{enums.StateComplete}, helper.FilterByChildrenRows(roleIDs))
	if err != nil {
		return nil, err
	}

	resp := make([]response.UserCalendar, len(leaves))
	for i, leave := range leaves {
		resp[i] = response.UserCalendar{
			User: &response.UserInCalender{
				ID:         leave.UserID,
				FirstName:  leave.User.FirstName,
				LastName:   leave.User.LastName,
				Email:      leave.User.Email,
				EmployedAt: leave.User.EmployedAt,
			},
			ID:        *leave.ID,
			Type:      string(leave.LeaveType),
			Reason:    leave.Reason,
			StartDate: leave.StartDate,
			EndDate:   leave.EndDate,
		}
	}

	return resp, nil
}

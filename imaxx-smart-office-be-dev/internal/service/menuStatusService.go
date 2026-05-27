package service

import (
	"imaxx-smart-office-be/enums"
	"imaxx-smart-office-be/helper"
	"imaxx-smart-office-be/internal/repository"
	"imaxx-smart-office-be/internal/response"
	"log"

	"github.com/google/uuid"
)

type MenuStatusService interface {
	GetMyStatus(userID uuid.UUID) (*response.MenuStatus, error)
}

type MenuStatusServiceImpl struct {
	LeaveFormRepository repository.LeaveFormRepository
	UserRepository      repository.UserRepository
}

func NewMenuStatusServiceImpl(
	leaveFormRepository repository.LeaveFormRepository,
	userRepository repository.UserRepository,
) MenuStatusService {
	return &MenuStatusServiceImpl{
		LeaveFormRepository: leaveFormRepository,
		UserRepository:      userRepository,
	}
}

func (m *MenuStatusServiceImpl) GetMyStatus(userID uuid.UUID) (*response.MenuStatus, error) {
	roleIDs, err := m.UserRepository.GetUserRoleIDs(userID)
	if err != nil {
		log.Printf("error finding users: %v", err)
		return nil, helper.NewNotFoundError("ไม่เจอผู้ใช้")
	}

	leaves, err := m.LeaveFormRepository.FindCountByFilter("state IN (?)", []interface{}{
		[]enums.LeaveState{enums.StateWaitingManager, enums.StateWaitingHR},
	}, helper.FilterByRoleWithChildren(roleIDs))
	if err != nil {
		return nil, err
	}

	resp := response.MenuStatus{
		MyTaskCount: leaves,
	}

	return &resp, nil
}

package service

import (
	"imaxx-smart-office-be/enums"
	"imaxx-smart-office-be/helper"
	pcRepo "imaxx-smart-office-be/internal/pettycash/repository"
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
	PettyCashRepo       pcRepo.PettyCashRepository
}

func NewMenuStatusServiceImpl(
	leaveFormRepository repository.LeaveFormRepository,
	userRepository repository.UserRepository,
	pettyCashRepo pcRepo.PettyCashRepository,
) MenuStatusService {
	return &MenuStatusServiceImpl{
		LeaveFormRepository: leaveFormRepository,
		UserRepository:      userRepository,
		PettyCashRepo:       pettyCashRepo,
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

	var pcRoleIDs []any
	for _, id := range roleIDs {
		pcRoleIDs = append(pcRoleIDs, id)
	}

	var pcTasks int64 = 0
	if m.PettyCashRepo != nil {
		pcTasks, _ = m.PettyCashRepo.CountAll(pcRepo.PettyCashFilter{
			View:    "tasks",
			RoleIDs: pcRoleIDs,
		})
	}

	resp := response.MenuStatus{
		MyTaskCount:        leaves,
		PettycashTaskCount: &pcTasks,
	}

	return &resp, nil
}

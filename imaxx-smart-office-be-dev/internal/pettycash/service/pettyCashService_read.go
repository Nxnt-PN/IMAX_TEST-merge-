package service

import (
	"errors"

	"imaxx-smart-office-be/internal/pettycash/model"
	"imaxx-smart-office-be/internal/pettycash/repository"

	"github.com/google/uuid"
)

func (s *pettyCashServiceImpl) GetPettyCashList(filter repository.PettyCashFilter) ([]model.PettyCashForm, error) {
	return s.repo.FindAll(filter)
}

func (s *pettyCashServiceImpl) CountPettyCashList(filter repository.PettyCashFilter) (int64, error) {
	return s.repo.CountAll(filter)
}

func (s *pettyCashServiceImpl) GetPettyCashByID(id string) (*model.PettyCashForm, error) {
	formUUID, err := uuid.Parse(id)
	if err != nil {
		return nil, errors.New("invalid form id")
	}
	return s.repo.FindByID(formUUID)
}

func (s *pettyCashServiceImpl) GetPettyCashHistory(id string) ([]model.PettyCashHistory, error) {
	formUUID, err := uuid.Parse(id)
	if err != nil {
		return nil, errors.New("invalid form id")
	}
	return s.repo.GetHistoryByFormID(formUUID)
}

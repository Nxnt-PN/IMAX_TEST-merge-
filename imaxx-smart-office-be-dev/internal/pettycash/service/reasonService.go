package service

import (
	"imaxx-smart-office-be/internal/pettycash/model"
	"imaxx-smart-office-be/internal/pettycash/repository"
	"imaxx-smart-office-be/internal/pettycash/request"
)

type ReasonService interface {
	GetAllReasons(filter repository.ReasonFilter) ([]model.Reason, error)
	CreateReason(req request.ReasonRequest) (model.Reason, error)
	UpdateReason(id string, req request.ReasonRequest) (model.Reason, error)
	DeleteReason(id string) error
}

type reasonServiceImpl struct {
	reasonRepo repository.ReasonRepository
}

func NewReasonService(repo repository.ReasonRepository) ReasonService {
	return &reasonServiceImpl{reasonRepo: repo}
}

func (s *reasonServiceImpl) GetAllReasons(filter repository.ReasonFilter) ([]model.Reason, error) {
	return s.reasonRepo.FindAll(filter)
}

func (s *reasonServiceImpl) CreateReason(req request.ReasonRequest) (model.Reason, error) {
	systemID := req.SystemID
	if systemID == nil {
		system, err := s.reasonRepo.FindSystemBySlug("petty-cash")
		if err == nil {
			systemID = &system.ID
		}
	}

	reason := model.Reason{
		ReasonName: req.ReasonName,
		SystemID:   systemID,
	}
	err := s.reasonRepo.Create(&reason)
	return reason, err
}

func (s *reasonServiceImpl) UpdateReason(id string, req request.ReasonRequest) (model.Reason, error) {
	reason, err := s.reasonRepo.FindByID(id)
	if err != nil {
		return reason, err
	}
	reason.ReasonName = req.ReasonName
	reason.SystemID = req.SystemID
	err = s.reasonRepo.Update(&reason)
	return reason, err
}

func (s *reasonServiceImpl) DeleteReason(id string) error {
	reason, err := s.reasonRepo.FindByID(id)
	if err != nil {
		return err
	}
	return s.reasonRepo.Delete(&reason)
}

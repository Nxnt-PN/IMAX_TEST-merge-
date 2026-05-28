package service

import (
	"imaxx-smart-office-be/internal/pettycash/model"
	"imaxx-smart-office-be/internal/pettycash/repository"
	"imaxx-smart-office-be/internal/pettycash/request"

	"github.com/google/uuid"
)

type PettyCashService interface {
	GetPettyCashList(filter repository.PettyCashFilter) ([]model.PettyCashForm, error)
	CountPettyCashList(filter repository.PettyCashFilter) (int64, error)
	GetPettyCashByID(id string) (*model.PettyCashForm, error)
	GetPettyCashHistory(id string) ([]model.PettyCashHistory, error)
	CreatePettyCash(userID uuid.UUID, req request.CreatePettyCashRequest) (*model.PettyCashForm, error)
	UpdatePettyCash(id string, userID uuid.UUID, req request.UpdatePettyCashRequest) (*model.PettyCashForm, error)
	SubmitForm(id string, userID uuid.UUID, remark string) (*model.PettyCashForm, error)
	ApproveForm(id string, approverID uuid.UUID, remark string) error
	RejectForm(id string, approverID uuid.UUID, remark string) error
	CancelForm(id string, userID uuid.UUID, remark string) error
	ResendForm(id string, userID uuid.UUID, req request.UpdatePettyCashRequest) (*model.PettyCashForm, error)
}

type pettyCashServiceImpl struct {
	repo repository.PettyCashRepository
}

func NewPettyCashService(repo repository.PettyCashRepository) PettyCashService {
	return &pettyCashServiceImpl{repo: repo}
}

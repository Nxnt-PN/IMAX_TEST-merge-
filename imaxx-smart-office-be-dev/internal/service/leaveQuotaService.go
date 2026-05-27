package service

import (
	"errors"
	"imaxx-smart-office-be/helper"
	"imaxx-smart-office-be/internal/model"
	"imaxx-smart-office-be/internal/repository"
	"imaxx-smart-office-be/internal/request"
	"strconv"
	"strings"

	"github.com/google/uuid"
	"github.com/jinzhu/copier"
	"gorm.io/gorm"
)

type LeaveQuotaService interface {
	FindAll(pagination helper.Pagination) *helper.Pagination
	Create(req request.CreateLeaveQuotaRequest) (model.LeaveQuota, error)
	FindById(id uuid.UUID) (model.LeaveQuota, error)
	Update(id uuid.UUID, user request.UpdateLeaveQuotaRequest) (model.LeaveQuota, error)
	Delete(id uuid.UUID, actionID uuid.UUID) error
	CheckYearDuplicated(year int, currentId *uuid.UUID) bool
}

type LeaveQuotaServiceImpl struct {
	LeaveQuotaRepository repository.LeaveQuotaRepository
}

func NewLeaveQuotaServiceImpl(leaveQuotaRepository repository.LeaveQuotaRepository) LeaveQuotaService {
	return &LeaveQuotaServiceImpl{
		LeaveQuotaRepository: leaveQuotaRepository,
	}
}

func (l *LeaveQuotaServiceImpl) FindAll(pagination helper.Pagination) *helper.Pagination {
	var filters []interface{}
	var whereText string = ""

	if pagination.Keyword != "" {
		keyword := strings.TrimSpace(pagination.Keyword)

		// check if is number
		if _, err := strconv.Atoi(keyword); err == nil {
			if whereText != "" {
				whereText += " AND "
			}

			// ใช้ % สองฝั่งเพื่อให้หาคำว่า "16" ใน "2016" เจอ
			whereText += "CAST(year AS TEXT) LIKE ?"
			filters = append(filters, "%"+keyword+"%")
		}
	}

	return l.LeaveQuotaRepository.FindAll(pagination, whereText, filters)
}

func (l *LeaveQuotaServiceImpl) Create(req request.CreateLeaveQuotaRequest) (model.LeaveQuota, error) {
	leaveQuotaCreate := model.LeaveQuota{}

	if err := copier.Copy(&leaveQuotaCreate, &req); err != nil {
		return model.LeaveQuota{}, err
	}

	resp, err := l.LeaveQuotaRepository.Create(leaveQuotaCreate)
	if err != nil {
		return model.LeaveQuota{}, err
	}

	return resp, nil
}

func (l *LeaveQuotaServiceImpl) FindById(id uuid.UUID) (model.LeaveQuota, error) {
	data, result := l.LeaveQuotaRepository.FindById(id)
	return data, result.Error
}

func (l *LeaveQuotaServiceImpl) CheckYearDuplicated(year int, currentId *uuid.UUID) bool {
	var filters []interface{}
	filters = append(filters, year)
	whereText := "year = ?"
	if currentId != nil {
		whereText += " AND id != ?"
		filters = append(filters, currentId)
	}
	_, result := l.LeaveQuotaRepository.FindByFilterFirst(whereText, filters)

	return !errors.Is(result.Error, gorm.ErrRecordNotFound)
}

func (l *LeaveQuotaServiceImpl) Update(id uuid.UUID, leaveQuota request.UpdateLeaveQuotaRequest) (model.LeaveQuota, error) {
	leaveQuotaUpdate := model.LeaveQuota{}
	copier.Copy(&leaveQuotaUpdate, &leaveQuota)

	l.LeaveQuotaRepository.Update(id, leaveQuotaUpdate)

	result, err := l.FindById(id)

	return result, err
}

func (l *LeaveQuotaServiceImpl) Delete(id uuid.UUID, actionID uuid.UUID) error {
	l.LeaveQuotaRepository.Update(id, model.LeaveQuota{
		BaseModel: model.BaseModel{
			DeletedBy: &actionID,
		},
	})

	return l.LeaveQuotaRepository.Delete(id)
}

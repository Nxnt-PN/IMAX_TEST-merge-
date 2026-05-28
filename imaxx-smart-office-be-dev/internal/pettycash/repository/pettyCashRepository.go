package repository

import (
	"fmt"
	"imaxx-smart-office-be/internal/pettycash/model"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type PettyCashFilter struct {
	SubmitDate  string
	EndDate     string
	Year        string
	Status      string
	Project     string
	Reason      string
	Keyword     string
	View        string
	RequesterID string
	UserID      uuid.UUID
	RoleIDs     []any
	Page        int
	Limit       int
}

type PettyCashRepository interface {
	FindAll(filter PettyCashFilter) ([]model.PettyCashForm, error)
	CountAll(filter PettyCashFilter) (int64, error)
	FindByID(id uuid.UUID) (*model.PettyCashForm, error)
	Create(form *model.PettyCashForm) error
	Update(form *model.PettyCashForm) error
	UpdateWithItems(form *model.PettyCashForm, newItems []model.PettyCashFormItem) error
	SaveHistory(history *model.PettyCashHistory) error
	CreateNotification(notification *model.Notification) error
	FindUsersByRoleID(roleID uuid.UUID) ([]model.User, error)
	UserHasRole(userID uuid.UUID, roleID uuid.UUID) (bool, error)
	GetHistoryByFormID(formID uuid.UUID) ([]model.PettyCashHistory, error)
	FindWorkflowDetails(workflowID uuid.UUID) ([]model.WorkflowDetail, error)
	GetFirstWorkflow() (*model.Workflow, error)
	GetWorkflowBySystemSlug(slug string) (*model.Workflow, error)
}

type pettyCashRepositoryImpl struct {
	db *gorm.DB
}

func NewPettyCashRepository(db *gorm.DB) PettyCashRepository {
	return &pettyCashRepositoryImpl{db: db}
}

func (r *pettyCashRepositoryImpl) applyFilter(query *gorm.DB, f PettyCashFilter) *gorm.DB {
	if f.View == "tasks" {
		if len(f.RoleIDs) > 0 {
			query = query.Where("state = ? AND role_id IN ?", 2, f.RoleIDs)
		} else {
			query = query.Where("1 = 0")
		}
	} else if f.View != "all" {
		query = query.Where("user_id = ?", f.UserID)
	}
	if f.RequesterID != "" {
		query = query.Where("user_id = ?", f.RequesterID)
	}

	if f.SubmitDate != "" {
		query = query.Where("DATE(created_at) >= ?", f.SubmitDate)
	}
	if f.EndDate != "" {
		query = query.Where("DATE(created_at) <= ?", f.EndDate)
	}
	if f.Year != "" {
		query = query.Where("EXTRACT(YEAR FROM created_at) = ?", f.Year)
	}
	if f.Status != "" {
		statuses := make([]string, 0)
		for _, item := range strings.Split(f.Status, ",") {
			if trimmed := strings.TrimSpace(item); trimmed != "" {
				statuses = append(statuses, trimmed)
			}
		}
		if len(statuses) == 1 {
			query = query.Where("state = ?", statuses[0])
		} else if len(statuses) > 1 {
			query = query.Where("state IN ?", statuses)
		}
	}
	if f.Project != "" {
		query = query.Where("EXISTS (SELECT 1 FROM petty_cash_form_items WHERE petty_cash_form_items.petty_cash_form_id = petty_cash_forms.id AND petty_cash_form_items.project_id = ?)", f.Project)
	}
	if f.Reason != "" {
		reasonIDs := make([]string, 0)
		for _, item := range strings.Split(f.Reason, ",") {
			if trimmed := strings.TrimSpace(item); trimmed != "" {
				reasonIDs = append(reasonIDs, trimmed)
			}
		}
		if len(reasonIDs) > 0 {
			query = query.Where("EXISTS (SELECT 1 FROM petty_cash_form_items WHERE petty_cash_form_items.petty_cash_form_id = petty_cash_forms.id AND petty_cash_form_items.reason_id IN ?)", reasonIDs)
		}
	}
	if f.Keyword != "" {
		kw := "%" + f.Keyword + "%"
		query = query.Where("title ILIKE ? OR note ILIKE ? OR EXISTS (SELECT 1 FROM petty_cash_form_items WHERE petty_cash_form_items.petty_cash_form_id = petty_cash_forms.id AND petty_cash_form_items.description ILIKE ?)", kw, kw, kw)
	}
	return query
}

func (r *pettyCashRepositoryImpl) FindAll(f PettyCashFilter) ([]model.PettyCashForm, error) {
	query := r.db.Model(&model.PettyCashForm{}).Preload("Items").Preload("Items.Project").Preload("Items.Reason").Preload("History").Preload("History.User").Preload("History.User.Roles").Preload("User").Preload("User.Roles").Preload("User.Location").Preload("Role").Preload("RejectedUser").Preload("RejectedUser.Roles")
	query = r.applyFilter(query, f)
	if f.Limit > 0 {
		page := f.Page
		if page < 1 {
			page = 1
		}
		query = query.Offset((page - 1) * f.Limit).Limit(f.Limit)
	}

	var forms []model.PettyCashForm
	err := query.Order("created_at desc").Find(&forms).Error
	return forms, err
}

func (r *pettyCashRepositoryImpl) CountAll(f PettyCashFilter) (int64, error) {
	var total int64
	query := r.db.Model(&model.PettyCashForm{})
	query = r.applyFilter(query, f)
	err := query.Count(&total).Error
	return total, err
}

func (r *pettyCashRepositoryImpl) FindByID(id uuid.UUID) (*model.PettyCashForm, error) {
	var form model.PettyCashForm
	err := r.db.Preload("Items.Attachments").Preload("Items.Project").Preload("Items.Reason").Preload("Workflow.Details.Role").Preload("History").Preload("History.User").Preload("History.User.Roles").Preload("User").Preload("User.Roles").Preload("User.Location").Preload("Role").Preload("RejectedUser").Preload("RejectedUser.Roles").First(&form, "id = ?", id).Error
	return &form, err
}

func (r *pettyCashRepositoryImpl) Create(form *model.PettyCashForm) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if form.DocumentNo == "" {
			documentNo, err := r.nextDocumentNo(tx, time.Now().UTC().Year())
			if err != nil {
				return err
			}
			form.DocumentNo = documentNo
		}
		return tx.Omit("RoleID").Create(form).Error
	})
}

func (r *pettyCashRepositoryImpl) nextDocumentNo(tx *gorm.DB, year int) (string, error) {
	if err := tx.Exec("SELECT pg_advisory_xact_lock(?)", int64(year)).Error; err != nil {
		return "", err
	}

	prefix := fmt.Sprintf("PC-%d-", year)
	var lastDocumentNo string
	err := tx.Model(&model.PettyCashForm{}).
		Where("document_no LIKE ?", prefix+"%").
		Order("document_no DESC").
		Limit(1).
		Pluck("document_no", &lastDocumentNo).Error
	if err != nil {
		return "", err
	}

	next := 1
	if lastDocumentNo != "" {
		if n, err := strconv.Atoi(strings.TrimPrefix(lastDocumentNo, prefix)); err == nil {
			next = n + 1
		}
	}
	return fmt.Sprintf("%s%04d", prefix, next), nil
}

func (r *pettyCashRepositoryImpl) Update(form *model.PettyCashForm) error {
	return r.db.Session(&gorm.Session{FullSaveAssociations: true}).Updates(form).Error
}

func (r *pettyCashRepositoryImpl) UpdateWithItems(form *model.PettyCashForm, newItems []model.PettyCashFormItem) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		var existingItemIDs []uuid.UUID
		if err := tx.Model(&model.PettyCashFormItem{}).
			Where("petty_cash_form_id = ?", form.ID).
			Pluck("id", &existingItemIDs).Error; err != nil {
			return err
		}
		if len(existingItemIDs) > 0 {
			if err := tx.Where("petty_cash_form_item_id IN ?", existingItemIDs).Delete(&model.Attachment{}).Error; err != nil {
				return err
			}
		}
		if err := tx.Where("petty_cash_form_id = ?", form.ID).Delete(&model.PettyCashFormItem{}).Error; err != nil {
			return err
		}
		if err := tx.Omit("User", "Workflow", "Role", "RoleID", "RejectedUser", "Items", "History").Save(form).Error; err != nil {
			return err
		}
		if len(newItems) > 0 {
			if err := tx.Create(&newItems).Error; err != nil {
				return err
			}
		}
		return nil
	})
}

func (r *pettyCashRepositoryImpl) SaveHistory(history *model.PettyCashHistory) error {
	return r.db.Create(history).Error
}

func (r *pettyCashRepositoryImpl) CreateNotification(notification *model.Notification) error {
	return r.db.Create(notification).Error
}

func (r *pettyCashRepositoryImpl) FindUsersByRoleID(roleID uuid.UUID) ([]model.User, error) {
	var users []model.User
	err := r.db.Joins("JOIN user_roles ON user_roles.user_id = users.id").
		Where("user_roles.role_id = ?", roleID).
		Find(&users).Error
	return users, err
}

func (r *pettyCashRepositoryImpl) UserHasRole(userID uuid.UUID, roleID uuid.UUID) (bool, error) {
	var count int64
	err := r.db.Model(&model.UserRole{}).
		Where("user_id = ? AND role_id = ?", userID, roleID).
		Count(&count).Error
	return count > 0, err
}

func (r *pettyCashRepositoryImpl) GetHistoryByFormID(formID uuid.UUID) ([]model.PettyCashHistory, error) {
	var histories []model.PettyCashHistory
	err := r.db.Preload("User").Preload("User.Roles").Where("petty_cash_form_id = ?", formID).Order("created_at asc").Find(&histories).Error
	return histories, err
}

func (r *pettyCashRepositoryImpl) FindWorkflowDetails(workflowID uuid.UUID) ([]model.WorkflowDetail, error) {
	var details []model.WorkflowDetail
	err := r.db.Preload("Role").Where("workflow_id = ?", workflowID).Order("seq asc").Find(&details).Error
	return details, err
}

func (r *pettyCashRepositoryImpl) GetFirstWorkflow() (*model.Workflow, error) {
	var workflow model.Workflow
	err := r.db.First(&workflow).Error
	return &workflow, err
}

func (r *pettyCashRepositoryImpl) GetWorkflowBySystemSlug(slug string) (*model.Workflow, error) {
	var system model.System
	err := r.db.Preload("Workflow").Where("slug = ?", slug).First(&system).Error
	return system.Workflow, err
}

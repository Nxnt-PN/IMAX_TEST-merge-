package request

import "github.com/google/uuid"

type PettyCashItemRequest struct {
	ProjectID   uuid.UUID           `json:"project_id"`
	ReasonID    uuid.UUID           `json:"reason_id"`
	Date        string              `json:"date"`
	Description string              `json:"description"`
	Note        string              `json:"note"`
	Amount      int                 `json:"amount"`
	Attachments []AttachmentRequest `json:"attachments"`
}

type AttachmentRequest struct {
	FileName string `json:"file_name" binding:"required"`
	FilePath string `json:"file_path" binding:"required"`
	FileSize int    `json:"file_size"`
}

type CreatePettyCashRequest struct {
	Title  string                 `json:"title" binding:"required"`
	Note   string                 `json:"note"`
	Remark string                 `json:"remark"`
	Items  []PettyCashItemRequest `json:"items"`
}

type UpdatePettyCashRequest struct {
	Title  string                 `json:"title" binding:"required"`
	Note   string                 `json:"note"`
	Remark string                 `json:"remark"`
	Items  []PettyCashItemRequest `json:"items"`
}

type ActionPettyCashRequest struct {
	Remark string `json:"remark"`
}

type RejectPettyCashRequest struct {
	Remark        string `json:"remark"`
	RejectComment string `json:"reject_comment"`
}

func (r RejectPettyCashRequest) Comment() string {
	if r.Remark != "" {
		return r.Remark
	}
	return r.RejectComment
}

type CancelPettyCashRequest struct {
	Remark string `json:"remark"`
}

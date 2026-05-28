package request

import "github.com/google/uuid"

type ReasonRequest struct {
	ReasonName     string     `json:"ReasonName" binding:"required"`
	Description    string     `json:"Description"`
	SystemID       *uuid.UUID `json:"system_id"`
	LegacySystemID *uuid.UUID `json:"SystemID"`
}

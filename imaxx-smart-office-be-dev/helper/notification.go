package helper

import (
	"github.com/google/uuid"
)

// query struct
type NotiFilter struct {
	ID      *uuid.UUID
	UserID  *uuid.UUID
	Title   *string
	Message *string
	Link    *string
	IsRead  *int
}

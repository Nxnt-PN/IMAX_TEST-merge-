package response

import "github.com/google/uuid"

type NotificationResponse struct {
	ID      uuid.UUID `json:"id"`
	UserID  uuid.UUID `json:"user_id"`
	Title   string    `json:"title"`
	Message string    `json:"message"`
	Link    *string   `json:"link"`
	IsRead  int       `json:"is_read"`
	Type    string    `json:"type"`
}

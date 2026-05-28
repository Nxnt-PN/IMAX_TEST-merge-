package response

import "github.com/google/uuid"

type ErrorResponse struct {
	Error string `json:"error"`
}

type MessageResponse struct {
	Message string `json:"message"`
}

type PettyCashListItemResponse struct {
	ID           uuid.UUID `json:"id"`
	DocumentNo   string    `json:"documentNo"`
	Date         string    `json:"date"`
	Title        string    `json:"title"`
	Project      string    `json:"project"`
	Reason       string    `json:"reason"`
	Amount       string    `json:"amount"`
	State        int       `json:"state"`
	Status       string    `json:"status"`
	StateDetail  string    `json:"stateDetail"`
	CurrentRole  string    `json:"currentRole"`
	RejectReason string    `json:"rejectReason"`
}

type CreatePettyCashResponse struct {
	Message     string      `json:"message"`
	ID          uuid.UUID   `json:"id"`
	DocumentNo  string      `json:"documentNo"`
	TotalAmount int         `json:"total_amount"`
	Data        interface{} `json:"data"`
}

type UpdatePettyCashResponse struct {
	Message string    `json:"message"`
	ID      uuid.UUID `json:"id"`
}

type UploadResponse struct {
	URL      string `json:"url"`
	FileName string `json:"fileName"`
	FileSize int64  `json:"fileSize"`
}

type PettyCashSummaryResponse struct {
	TotalRequests     int64 `json:"total_requests"`
	DraftRequests     int64 `json:"draft_requests"`
	WaitingRequests   int64 `json:"waiting_requests"`
	CompletedRequests int64 `json:"completed_requests"`
	RejectedRequests  int64 `json:"rejected_requests"`
	CancelledRequests int64 `json:"cancelled_requests"`
	TotalAmount       int64 `json:"total_amount"`
}

type PaginationResponse struct {
	Page       int   `json:"page"`
	Limit      int   `json:"limit"`
	Total      int64 `json:"total"`
	TotalPages int64 `json:"total_pages"`
}

type PaginatedPettyCashListResponse struct {
	Data       []PettyCashListItemResponse `json:"data"`
	Pagination PaginationResponse          `json:"pagination"`
}

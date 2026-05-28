package request

type ProjectRequest struct {
	ProjectName string `json:"ProjectName" binding:"required"`
	Description string `json:"Description"`
}

package request

type AuthenticateRequest struct {
	Username string `validate:"required,min=1,max=255" json:"username"`
	Password string `validate:"required,min=1,max=255" json:"password"`
}

package response

type AuthResponse struct {
	Token            string      `json:"token"`
	RefreshToken     string      `json:"refresh_token"`
	ExpiredAt        int64       `json:"expired_at"`
	RefreshExpiredAt int64       `json:"refresh_expired_at"`
	User             interface{} `json:"user"`
}

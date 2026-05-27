package response

import (
	"github.com/dgrijalva/jwt-go"
	"github.com/google/uuid"
)

type AuthClaims struct {
	ID       uuid.UUID `json:"id"`
	Username string    `json:"username"`
	jwt.StandardClaims
}

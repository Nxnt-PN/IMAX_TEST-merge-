package controller

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

type errorRule struct {
	status  int
	phrases []string
}

var pettyCashErrorRules = []errorRule{
	{
		status: http.StatusForbidden,
		phrases: []string{
			"only requester",
			"approver does not have",
			"Forbidden",
		},
	},
	{
		status:  http.StatusNotFound,
		phrases: []string{"not found"},
	},
	{
		status: http.StatusBadRequest,
		phrases: []string{
			"invalid",
			"not in draft",
			"not pending",
			"only draft",
			"only rejected",
		},
	},
}

func writePettyCashError(ctx *gin.Context, err error) {
	message := err.Error()
	status := http.StatusInternalServerError
	for _, rule := range pettyCashErrorRules {
		if containsAny(message, rule.phrases) {
			status = rule.status
			break
		}
	}
	ctx.JSON(status, gin.H{"error": message})
}

func containsAny(value string, phrases []string) bool {
	for _, phrase := range phrases {
		if strings.Contains(value, phrase) {
			return true
		}
	}
	return false
}

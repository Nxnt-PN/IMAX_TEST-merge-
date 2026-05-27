package helper

import (
	"imaxx-smart-office-be/enums"
	"slices"
)

func LocationToRoleNames(l string) []string {
	switch l {
	case string(enums.Forum):
		return []string{
			string(enums.Employee),
			string(enums.Manager),
			string(enums.HR)}
	case string(enums.Aomsin):
		return []string{""}
	default:
		return nil
	}
}

func isForum(r string) bool {
	switch r {
	case string(enums.Employee):
		return true
	case string(enums.Manager):
		return true
	case string(enums.HR):
		return true
	default:
		return false
	}
}

func isAomsin(r string) bool {
	switch r {
	default:
		return false
	}
}

func LocationRoles(roleNames []string) string {
	hasForumRole := slices.ContainsFunc(roleNames, func(r string) bool {
		return isForum(r)
	})
	hasAomsinRole := slices.ContainsFunc(roleNames, func(r string) bool {
		return isAomsin(r)
	})

	if hasForumRole && hasAomsinRole {
		return string(enums.Other) // exec
	} else if hasForumRole {
		return string(enums.Forum)
	} else if hasAomsinRole {
		return string(enums.Aomsin)
	}
	return string(enums.Other)
}

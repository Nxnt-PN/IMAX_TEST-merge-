package controller

import (
	"fmt"
	"strings"

	"imaxx-smart-office-be/internal/pettycash/model"
)

// rolePriority กำหนดลำดับอาวุโสของ role (มากกว่า = สูงกว่า)
// ค่า -1 = ข้าม (ไม่แสดง)
var rolePriority = map[string]int{
	"administrator":  -1, // ข้าม
	"manager":        4,
	"finance":        3,
	"human resource": 2,
	"employee":       1,
}

// primaryRole คืน role ที่มีลำดับสูงสุดของผู้ใช้ ยกเว้น Administrator
// ถ้าไม่มี role ในรายการ fallback เป็น role แรกที่ไม่ใช่ admin
func primaryRole(roles []model.Role) string {
	best := ""
	bestPriority := -2
	var fallback string

	for _, r := range roles {
		name := strings.TrimSpace(r.Name)
		if name == "" {
			continue
		}
		prio, known := rolePriority[strings.ToLower(name)]
		if known && prio == -1 {
			continue // ข้าม admin
		}
		if fallback == "" {
			fallback = name
		}
		if !known {
			prio = 0 // role ที่ไม่รู้จักได้ priority 0
		}
		if prio > bestPriority {
			bestPriority = prio
			best = name
		}
	}

	if best != "" {
		return best
	}
	return fallback // fallback กรณีไม่มี role ที่รู้จักเลย
}

func toPettyCashListResponse(forms []model.PettyCashForm) []map[string]interface{} {
	rows := make([]map[string]interface{}, 0, len(forms))
	for _, form := range forms {
		rows = append(rows, toPettyCashListItem(form))
	}
	return rows
}

func toPettyCashListItem(form model.PettyCashForm) map[string]interface{} {
	project, reason, date := listProjectReasonDate(form)
	rejectReason, rejectedByName := rejectionMeta(form)
	requesterName, requesterRole, requesterLocation, requesterAvatarPath := requesterMeta(form)

	currentRole := ""
	if form.Role != nil {
		currentRole = form.Role.Name
	}

	return map[string]interface{}{
		"id":                  form.ID,
		"documentNo":          form.DocumentNo,
		"date":                date,
		"title":               form.Title,
		"requesterName":       requesterName,
		"requesterRole":       requesterRole,
		"requesterLocation":   requesterLocation,
		"requesterAvatarPath": requesterAvatarPath,
		"project":             project,
		"reason":              reason,
		"amount":              fmt.Sprintf("฿%d", form.TotalAmount),
		"state":               form.State,
		"status":              statusText(form),
		"stateDetail":         form.StateDetail,
		"currentRole":         currentRole,
		"rejectReason":        rejectReason,
		"rejectedByName":      rejectedByName,
	}
}

func listProjectReasonDate(form model.PettyCashForm) (string, string, string) {
	project := "-"
	reason := "-"
	date := form.CreatedAt.Format("02 Jan 2006")
	if len(form.Items) == 0 {
		return project, reason, date
	}

	projectNames := make([]string, 0)
	reasonNames := make([]string, 0)
	seenProjects := map[string]bool{}
	seenReasons := map[string]bool{}
	for _, item := range form.Items {
		if item.Project != nil && item.Project.ProjectName != "" && !seenProjects[item.Project.ProjectName] {
			seenProjects[item.Project.ProjectName] = true
			projectNames = append(projectNames, item.Project.ProjectName)
		}
		if item.Reason != nil && item.Reason.ReasonName != "" && !seenReasons[item.Reason.ReasonName] {
			seenReasons[item.Reason.ReasonName] = true
			reasonNames = append(reasonNames, item.Reason.ReasonName)
		}
	}
	if len(projectNames) > 0 {
		project = strings.Join(projectNames, ", ")
	}
	if len(reasonNames) > 0 {
		reason = strings.Join(reasonNames, ", ")
	}
	return project, reason, form.Items[0].Date.Format("02 Jan 2006")
}

func rejectionMeta(form model.PettyCashForm) (string, string) {
	rejectReason := ""
	rejectedByName := ""
	if form.State == 4 {
		for _, history := range form.History {
			if history.Action == "Rejected" {
				rejectReason = history.Remark
				rejectedByName = personName(history.User)
			}
		}
	}
	if rejectedByName == "" {
		rejectedByName = personName(form.RejectedUser)
	}
	return rejectReason, rejectedByName
}

func requesterMeta(form model.PettyCashForm) (string, string, string, string) {
	if form.User == nil {
		return "", "", "", ""
	}

	location := ""
	if form.User.Location != nil {
		location = form.User.Location.LocationName
	}

	avatarPath := ""
	if form.User.AvatarPath != nil {
		avatarPath = *form.User.AvatarPath
	}
	if avatarPath == "" {
		avatarPath = form.User.ProfileImageURL
	}

	return personName(form.User), primaryRole(form.User.Roles), location, avatarPath
}

func personName(user *model.User) string {
	if user == nil {
		return ""
	}
	name := strings.TrimSpace(user.FirstName + " " + user.LastName)
	if name != "" {
		return name
	}
	return user.Username
}

func statusText(form model.PettyCashForm) string {
	switch form.State {
	case 2:
		if form.StateDetail != "" {
			return form.StateDetail
		}
		return "Waiting"
	case 3:
		return "Completed"
	case 4:
		return "Rejected"
	case 5:
		return "Cancelled"
	default:
		return "Draft"
	}
}

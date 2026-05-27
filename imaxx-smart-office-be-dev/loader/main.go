package main

import (
	"fmt"
	"imaxx-smart-office-be/internal/model"
	"io"
	"os"

	"ariga.io/atlas-provider-gorm/gormschema"
)

func main() {
	stmts, err := gormschema.New("postgres").Load(
		&model.User{},
		&model.Role{},
		&model.ParentChildRole{},
		&model.Permission{},
		&model.UserRole{},
		&model.RolePermission{},
		&model.Workflow{},
		&model.WorkflowDetail{},
		&model.System{},
		&model.LeaveQuota{},
		&model.LeaveQuotaDetail{},
		&model.LeaveForm{},
		&model.LeaveFormHistory{},
		&model.Notification{},
	)
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to load gorm schema: %v\n", err)
		os.Exit(1)
	}
	io.WriteString(os.Stdout, stmts)
}

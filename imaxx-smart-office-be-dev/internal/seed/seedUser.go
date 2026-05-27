package seed

import (
	"imaxx-smart-office-be/helper"
	"imaxx-smart-office-be/internal/model"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

func SeedUser(db *gorm.DB) {
	//users
	password, _ := helper.HashPassword("Asdlkj123")
	now := time.Now()
	user := model.User{
		Username:   "admin",
		Password:   password,
		FirstName:  "Admin",
		LastName:   "Nistrator",
		Email:      "info@imaxxsol.com",
		EmployedAt: now,
		Status:     1,
	}
	db.Model(&model.User{}).
		Where("username = ?", "admin").
		Assign(user).
		FirstOrCreate(&user)

	// //mgr
	// mgrPassword, _ := helper.HashPassword("password")
	// mgrUser := model.User{
	// 	Username:   "mgr",
	// 	Password:   mgrPassword,
	// 	FirstName:  "มานา",
	// 	LastName:   "เจอร์",
	// 	Email:      "mgr@imaxxsol.com",
	// 	EmployedAt: now,
	// 	Status:     1,
	// }
	// tx = db.Model(&model.User{}).
	// 	Where("username = ?", "mgr").
	// 	Updates(user)

	// if tx.RowsAffected == 0 {
	// 	db.Create(&mgrUser)
	// }

	// //hr
	// hrPassword, _ := helper.HashPassword("password")
	// hrUser := model.User{
	// 	Username:   "hr",
	// 	Password:   hrPassword,
	// 	FirstName:  "ทรัพยา",
	// 	LastName:   "กรมนุษย์",
	// 	Email:      "hr@imaxxsol.com",
	// 	EmployedAt: now,
	// 	Status:     1,
	// }
	// tx = db.Model(&model.User{}).
	// 	Where("username = ?", "hr").
	// 	Updates(user)

	// if tx.RowsAffected == 0 {
	// 	db.Create(&hrUser)
	// }

	// //emp
	// empPassword, _ := helper.HashPassword("password")
	// empUser := model.User{
	// 	Username:   "emp",
	// 	Password:   empPassword,
	// 	FirstName:  "พานัก",
	// 	LastName:   "งาน",
	// 	Email:      "emp@imaxxsol.com",
	// 	EmployedAt: now,
	// 	Status:     1,
	// }
	// tx = db.Model(&model.User{}).
	// 	Where("username = ?", "emp").
	// 	Updates(user)

	// if tx.RowsAffected == 0 {
	// 	db.Create(&empUser)
	// }

	var adminUser model.User
	db.Model(&model.User{}).Where("username = ?", "admin").First(&adminUser)
	userId := adminUser.ID

	permissions := []string{
		"view_user", "create_user", "edit_user", "delete_user", //user
		"view_role", "create_role", "edit_role", "delete_role", //role
		"view_workflow", "create_workflow", "edit_workflow", "delete_workflow", //workflow
		"view_system", "edit_system", //system
		"view_leave_quota", "create_leave_quota", "edit_leave_quota", "delete_leave_quota", //leave quota
		"view_leave_form", "create_leave_form", "edit_leave_form", "delete_leave_form", //leave form
		"view_my_task", "edit_my_task", //my task
		"save_leave", "submit_leave", "approve_leave", "reject_leave", "cancel_leave", //leave_review
		"view_report", "export_report", // report
	}
	for _, p := range permissions {
		var chkPermission int64 = 0
		db.Model(&model.Permission{}).
			Where("name = ?", p).Count(&chkPermission)
		if chkPermission == 0 {
			row := model.Permission{
				Name: p,
				BaseModel: model.BaseModel{
					CreatedBy: userId,
				},
			}
			db.Create(&row)
		}
	}

	roles := []string{
		"ผู้ดูแลระบบ", "ฝ่ายบุคคล", "ผู้จัดการ", "พนักงาน",
	}
	roles_eng := []string{
		"Administrator", "Human Resource", "Manager", "Employee",
	}
	var adminRoleId *uuid.UUID
	for i, r := range roles {
		var chkRole int64 = 0
		var chkRoleEng int64 = 0
		db.Model(&model.Role{}).
			Where("name = ?", r).Count(&chkRole)
		db.Model(&model.Role{}).
			Where("name = ?", roles_eng[i]).Count(&chkRoleEng)
		if chkRole == 0 && chkRoleEng == 0 {
			row := model.Role{
				Name:   roles_eng[i],
				Status: 1,
				BaseModel: model.BaseModel{
					CreatedBy: userId,
				},
			}
			db.Create(&row)
		} else if chkRole > 0 && chkRoleEng == 0 { //convert thai to eng
			var role model.Role
			db.Model(&role).Where("name = ? ", r).Updates(map[string]interface{}{
				"name": roles_eng[i],
			})
		}
	}

	var role model.Role
	db.Where("name = ? ", "Administrator").First(&role)
	adminRoleId = role.ID

	if adminRoleId != nil {
		var permissionAdmin []model.Permission

		db.Find(&permissionAdmin)
		rolePermissionRows := make([]model.RolePermission, 0, len(permissionAdmin))
		for _, p := range permissionAdmin {
			var chkRolePermission int64 = 0
			db.Model(&model.RolePermission{}).
				Where("role_id = ? and permission_id = ?", adminRoleId, p.ID).Count(&chkRolePermission)
			if chkRolePermission == 0 {
				rolePermissionRows = append(rolePermissionRows, model.RolePermission{
					RoleID:       *adminRoleId,
					PermissionID: *p.ID,
				})
			}

		}

		if len(rolePermissionRows) > 0 {
			db.Create(&rolePermissionRows)
		}

		//check user admin
		var chkUserRole int64 = 0
		db.Model(&model.UserRole{}).
			Where("role_id = ? and user_id = ?", adminRoleId, userId).Count(&chkUserRole)
		if chkUserRole == 0 {
			userRole := model.UserRole{
				UserID: *userId,
				RoleID: *adminRoleId,
			}
			db.Create(&userRole)
		}
	}

	// create hr permission

	// var hrUserFind model.User
	// db.Model(&model.User{}).Where("username = ?", "hr").First(&hrUserFind)
	// hrUserId := hrUserFind.ID

	// var hrRole model.Role
	// db.Where("name = ? ", "Human Resource").First(&hrRole)
	// hrRoleId := hrRole.ID

	// if hrRoleId != nil {
	// 	var permissionHr []model.Permission

	// 	permissionsHrList := []string{
	// 		"view_user", "create_user", "edit_user", "delete_user", //user
	// 		"view_workflow",                                                                //workflow
	// 		"view_system",                                                                  //system
	// 		"view_leave_quota",                                                             //leave quota
	// 		"view_leave_form", "create_leave_form", "edit_leave_form", "delete_leave_form", //leave form
	// 		"view_my_task", "edit_my_task", //my task
	// 		"save_leave", "submit_leave", "approve_leave", "reject_leave", "cancel_leave", //leave_review
	// 		"view_report", "export_report", // report
	// 	}

	// 	db.Where("name IN (?)", permissionsHrList).Find(&permissionHr)
	// 	rolePermissionRows := make([]model.RolePermission, 0, len(permissionHr))
	// 	for _, p := range permissionHr {
	// 		var chkRolePermission int64 = 0
	// 		db.Model(&model.RolePermission{}).
	// 			Where("role_id = ? and permission_id = ?", hrRoleId, p.ID).Count(&chkRolePermission)
	// 		if chkRolePermission == 0 {
	// 			rolePermissionRows = append(rolePermissionRows, model.RolePermission{
	// 				RoleID:       *hrRoleId,
	// 				PermissionID: *p.ID,
	// 			})
	// 		}

	// 	}
	// 	if len(rolePermissionRows) > 0 {
	// 		db.Create(&rolePermissionRows)
	// 	}

	// 	//ผูก user_role hr
	// 	var chkUserRole int64 = 0
	// 	db.Model(&model.UserRole{}).
	// 		Where("role_id = ? and user_id = ?", hrRoleId, hrUserId).Count(&chkUserRole)
	// 	if chkUserRole == 0 {
	// 		userRole := model.UserRole{
	// 			UserID: *hrUserId,
	// 			RoleID: *hrRoleId,
	// 		}
	// 		db.Create(&userRole)
	// 	}
	// }

	// // create mgr permission

	// var mgrUserFind model.User
	// db.Model(&model.User{}).Where("username = ?", "mgr").First(&mgrUserFind)
	// mgrUserId := mgrUserFind.ID

	// var mgrRole model.Role
	// db.Where("name = ? ", "Manager").First(&mgrRole)
	// mgrRoleId := mgrRole.ID

	// if mgrRoleId != nil {
	// 	var permissionMgr []model.Permission

	// 	permissionsMgrList := []string{
	// 		"view_user", "create_user", "edit_user", "delete_user", //user
	// 		"view_workflow",                                                                //workflow
	// 		"view_system",                                                                  //system
	// 		"view_leave_quota",                                                             //leave quota
	// 		"view_leave_form", "create_leave_form", "edit_leave_form", "delete_leave_form", //leave form
	// 		"view_my_task", "edit_my_task", //my task
	// 		"save_leave", "submit_leave", "approve_leave", "reject_leave", "cancel_leave", //leave_review
	// 		"view_report", "export_report", // report
	// 	}

	// 	db.Where("name IN (?)", permissionsMgrList).Find(&permissionMgr)
	// 	rolePermissionRows := make([]model.RolePermission, 0, len(permissionMgr))
	// 	for _, p := range permissionMgr {
	// 		var chkRolePermission int64 = 0
	// 		db.Model(&model.RolePermission{}).
	// 			Where("role_id = ? and permission_id = ?", mgrRoleId, p.ID).Count(&chkRolePermission)
	// 		if chkRolePermission == 0 {
	// 			rolePermissionRows = append(rolePermissionRows, model.RolePermission{
	// 				RoleID:       *mgrRoleId,
	// 				PermissionID: *p.ID,
	// 			})
	// 		}

	// 	}

	// 	if len(rolePermissionRows) > 0 {
	// 		db.Create(&rolePermissionRows)
	// 	}
	// 	//ผูก user_role mgr
	// 	var chkUserRole int64 = 0
	// 	db.Model(&model.UserRole{}).
	// 		Where("role_id = ? and user_id = ?", mgrRoleId, mgrUserId).Count(&chkUserRole)
	// 	if chkUserRole == 0 {
	// 		userRole := model.UserRole{
	// 			UserID: *mgrUserId,
	// 			RoleID: *mgrRoleId,
	// 		}
	// 		db.Create(&userRole)
	// 	}
	// }

	// // create emp permission

	// var empUserFind model.User
	// db.Model(&model.User{}).Where("username = ?", "emp").First(&empUserFind)
	// empUserId := empUserFind.ID

	// var empRole model.Role
	// db.Where("name = ? ", "Employee").First(&empRole)
	// empRoleId := empRole.ID

	// if empRoleId != nil {
	// 	var permissionEmp []model.Permission

	// 	permissionsEmpList := []string{
	// 		"view_user", "edit_user", //user
	// 		"view_workflow",                                                                //workflow
	// 		"view_system",                                                                  //system
	// 		"view_leave_quota",                                                             //leave quota
	// 		"view_leave_form", "create_leave_form", "edit_leave_form", "delete_leave_form", //leave form
	// 		"save_leave", "submit_leave", "cancel_leave", //leave_review
	// 	}

	// 	db.Where("name IN (?)", permissionsEmpList).Find(&permissionEmp)
	// 	rolePermissionRows := make([]model.RolePermission, 0, len(permissionEmp))
	// 	for _, p := range permissionEmp {
	// 		var chkRolePermission int64 = 0
	// 		db.Model(&model.RolePermission{}).
	// 			Where("role_id = ? and permission_id = ?", empRoleId, p.ID).Count(&chkRolePermission)
	// 		if chkRolePermission == 0 {
	// 			rolePermissionRows = append(rolePermissionRows, model.RolePermission{
	// 				RoleID:       *empRoleId,
	// 				PermissionID: *p.ID,
	// 			})
	// 		}

	// 	}
	// 	if len(rolePermissionRows) > 0 {
	// 		db.Create(&rolePermissionRows)
	// 	}
	// 	//ผูก user_role emp
	// 	var chkUserRole int64 = 0
	// 	db.Model(&model.UserRole{}).
	// 		Where("role_id = ? and user_id = ?", empRoleId, empUserId).Count(&chkUserRole)
	// 	if chkUserRole == 0 {
	// 		userRole := model.UserRole{
	// 			UserID: *empUserId,
	// 			RoleID: *empRoleId,
	// 		}
	// 		db.Create(&userRole)
	// 	}
	// }
}

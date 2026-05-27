package helper

import (
	"imaxx-smart-office-be/enums"
	"reflect"
	"time"

	"github.com/google/uuid"
)

// Criteria Struct
type LeaveCriteria struct {
	UserID    *uuid.UUID
	Keyword   string
	LeaveType enums.LeaveType
	DateRange []time.Time // [start, end]
	State     *enums.LeaveState
	RoleIDs   []uuid.UUID
	IDs       []uuid.UUID
	Name      string
}

func IsWeekend(t time.Time) bool {
	return t.Weekday() == time.Saturday || t.Weekday() == time.Sunday
}

func GetNonEmptyFields(v interface{}) []string {
	var fields []string
	val := reflect.ValueOf(v)

	// if it's pointer then get it value out
	if val.Kind() == reflect.Ptr {
		val = val.Elem()
	}

	typ := val.Type()
	for i := 0; i < val.NumField(); i++ {
		field := val.Field(i)
		fieldType := typ.Field(i)

		// // ignore filed Select (if has)
		// if fieldType.Tag.Get("json") == "-" && fieldType.Name != "WorkflowID" && fieldType.Name != "RoleID" {
		// 	// ignore logic
		// }

		// check if nil
		isZero := false
		switch field.Kind() {
		case reflect.Ptr, reflect.Interface:
			isZero = field.IsNil()
		default:
			isZero = field.IsZero()
		}

		// collect the non-nil field
		//if !isZero && field.Kind() != reflect.Slice {
		if !isZero && fieldType.Name != "LeaveFormHistories" {
			fields = append(fields, fieldType.Name)
		}
	}
	return fields
}

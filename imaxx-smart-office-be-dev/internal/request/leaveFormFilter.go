package request

import (
	"imaxx-smart-office-be/enums"
	"imaxx-smart-office-be/helper"
	"time"
)

type LeaveFormFilter struct {
	LeaveType enums.LeaveType   `form:"leave_type"`
	Year      int               `form:"year"`
	State     *enums.LeaveState `form:"state"`
	IDs       *string           `form:"ids"`
}

type LeaveReportFilter struct {
	Name      string     `form:"name"`
	StartDate *time.Time `form:"start_date" time_format:"2006-01-02"`
	EndDate   *time.Time `form:"end_date" time_format:"2006-01-02"`
}

type LeaveFormQuery struct {
	helper.Pagination
	LeaveFormFilter
	LeaveReportFilter
}

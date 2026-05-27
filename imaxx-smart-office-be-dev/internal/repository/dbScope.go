package repository

import (
	"imaxx-smart-office-be/helper"
	"math"

	"gorm.io/gorm"
)

func Paginate(value interface{}, pagination *helper.Pagination, query string, params []interface{}, db *gorm.DB, results ...*gorm.DB) func(db *gorm.DB) *gorm.DB {
	var totalRows int64
	tmpQuery := db.Model(value)
	if len(results) > 0 {
		tmpQuery = results[0].Model(value)
	} else {
		if len(params) == 0 && query != "" {
			tmpQuery = tmpQuery.Where(query)
		} else {
			tmpQuery = tmpQuery.Where(query, params...)
		}
	}
	tmpQuery.Session(&gorm.Session{}).Count(&totalRows)

	pagination.TotalRows = totalRows
	// fmt.Printf("total rows = %d, limit = %d", totalRows, pagination.Limit)
	totalPages := int64(math.Ceil(float64(totalRows) / float64(pagination.Limit)))
	// fmt.Printf("total pages = %d,", totalPages)
	if totalPages < 0 {
		totalPages = 0
	}
	pagination.TotalPages = int(totalPages)
	return func(db *gorm.DB) *gorm.DB {
		return db.Offset(pagination.GetOffset()).Limit(pagination.GetLimit()).Order(pagination.GetSort())
	}
}

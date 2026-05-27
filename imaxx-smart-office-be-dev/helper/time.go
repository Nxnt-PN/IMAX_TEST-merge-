package helper

import "time"

func YearRange(year int, location *time.Location) []time.Time {
	startYear := time.Date(year, 1, 1, 0, 0, 0, 0, location)
	endYear := time.Date(year, 12, 31, 23, 59, 59, 0, location)
	return []time.Time{startYear, endYear}
}

func DateRangeFinder(startDate, endDate *time.Time) []time.Time {
	if startDate == nil {
		sDate := time.Date(1900, 1, 1, 0, 0, 0, 0, endDate.Location())
		startDate = &sDate
	}

	if endDate == nil {
		eDate := time.Date(2100, 1, 1, 0, 0, 0, 0, startDate.Location())
		endDate = &eDate
	} else {
		y, m, d := endDate.Date()
		eDate := time.Date(y, m, d, 23, 59, 59, 0, endDate.Location())
		endDate = &eDate
	}

	return []time.Time{*startDate, *endDate}
}

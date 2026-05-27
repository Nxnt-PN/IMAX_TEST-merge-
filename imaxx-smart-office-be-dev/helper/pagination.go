package helper

type Pagination struct {
	Limit      int         `json:"limit,omitempty" form:"limit"`
	Page       int         `json:"page,omitempty" form:"page"`
	Sort       string      `json:"sort,omitempty" form:"sort"`
	TotalRows  int64       `json:"total_rows"`
	TotalPages int         `json:"total_pages"`
	Rows       interface{} `json:"rows"`

	Keyword string `json:"keyword,omitempty" form:"keyword"`
}

func (p *Pagination) NewPagination(sort string) Pagination {
	pagination := Pagination{}
	pagination.Page = 1
	pagination.Limit = 10
	pagination.Sort = sort
	return pagination
}
func (p *Pagination) GetOffset() int {
	return (p.GetPage() - 1) * p.GetLimit()
}

func (p *Pagination) GetLimit() int {
	if p.Limit == 0 {
		p.Limit = 10
	}
	return p.Limit
}

func (p *Pagination) GetPage() int {
	if p.Page == 0 {
		p.Page = 1
	}
	return p.Page
}

func (p *Pagination) GetSort() string {
	return p.Sort
}

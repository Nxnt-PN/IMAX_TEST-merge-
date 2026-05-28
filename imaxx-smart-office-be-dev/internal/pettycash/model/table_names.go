package model

func (PettyCashForm) TableName() string {
	return "petty_cash_forms"
}

func (PettyCashFormItem) TableName() string {
	return "petty_cash_form_items"
}

func (Attachment) TableName() string {
	return "petty_cash_attachments"
}

func (PettyCashHistory) TableName() string {
	return "petty_cash_histories"
}

func (Project) TableName() string {
	return "petty_cash_projects"
}

func (Reason) TableName() string {
	return "petty_cash_reasons"
}

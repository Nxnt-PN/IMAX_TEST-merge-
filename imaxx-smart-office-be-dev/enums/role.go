package enums

type Role string

const (
	Admin    Role = "Administrator"
	HR       Role = "Human Resource"
	Manager  Role = "Manager"
	Employee Role = "Employee"
)

type Location string

const (
	Forum  Location = "ฟอรั่ม"
	Aomsin Location = "ออมสิน"
	Other  Location = "-"
)

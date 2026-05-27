package enums

type LeaveType string

const (
	LeaveAbsence LeaveType = "absence"
	LeaveAnnual  LeaveType = "annual"
	LeaveSick    LeaveType = "sick"
	LeaveOther   LeaveType = "other"
)

// AllLeaveTypes
var AllLeaveTypes = []LeaveType{
	LeaveAbsence,
	LeaveAnnual,
	LeaveSick,
	LeaveOther,
}

func (l LeaveType) String() string {
	return string(l)
}

// LeaveType Validation Method
func (t LeaveType) IsValid() bool {
	for _, v := range AllLeaveTypes {
		if t == v {
			return true
		}
	}
	return false
}

type LeaveState int

const (
	StateDraft          LeaveState = 1   // ฉบับร่าง
	StateWaitingManager LeaveState = 2   // รอ Manager อนุมัติ
	StateWaitingHR      LeaveState = 3   // รอ HR อนุมัติ
	StateComplete       LeaveState = 100 // อนุมัติ
	StateCancelled      LeaveState = 101 // ยกเลิก
)

func (s LeaveState) String() string {
	switch s {
	case StateDraft:
		return "Draft"
	case StateWaitingManager:
		return "Waiting Manager Approval"
	case StateWaitingHR:
		return "Waiting HR Approval"
	case StateComplete:
		return "Complete"
	case StateCancelled:
		return "Cancelled"
	default:
		return "ไม่ทราบสถานะ"
	}
}

func NotCalculateStates() []int {
	return []int{int(StateDraft), int(StateCancelled)}
}

func StatesForValidateDate() []int {
	return []int{int(StateWaitingManager), int(StateWaitingHR), int(StateComplete)}
}

func StatesForCancelOwnLF() []LeaveState {
	return []LeaveState{StateWaitingManager, StateWaitingHR}
}

func (s LeaveState) IsStateNotApproveByFirst() bool {
	switch s {
	case StateWaitingManager:
		return true
	default:
		return false
	}
}

func (s LeaveState) IsCancellableLeaveState() bool {
	switch s {
	case StateWaitingManager, StateWaitingHR, StateComplete:
		return true
	default:
		return false
	}
}

func (s LeaveState) IsDeletableLeaveState() bool {
	switch s {
	case StateDraft, StateCancelled:
		return true
	default:
		return false
	}
}

func (s LeaveState) IsStateApproveBySome() bool {
	switch s {
	case StateWaitingHR, StateComplete:
		return true
	default:
		return false
	}
}

func (s LeaveState) IsStateWaiting() bool {
	switch s {
	case StateWaitingManager, StateWaitingHR:
		return true
	default:
		return false
	}
}

func (s LeaveState) IsStateFinished() bool {
	switch s {
	case StateComplete, StateCancelled:
		return true
	default:
		return false
	}
}

package enums

type ActionRequest string

const (
	ActionSave   ActionRequest = "save"
	ActionSubmit ActionRequest = "submit"
)

func (a ActionRequest) IsValid() bool {
	switch a {
	case ActionSave, ActionSubmit:
		return true
	}
	return false
}

// // Stringer Interface
// func (a ActionRequest) String() string {
// 	switch a {
// 	case ActionSave:
// 		return "💾 [ACTION: SAVE]"
// 	case ActionSubmit:
// 		return "🚀 [ACTION: SUBMIT]"
// 	default:
// 		return fmt.Sprintf("❓ [UNKNOWN ACTION: %s]", string(a))
// 	}
// }

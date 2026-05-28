package response

type MenuStatus struct {
	MyTaskCount        *int64 `json:"my_task_count"`
	PettycashTaskCount *int64 `json:"pettycash_task_count"`
}

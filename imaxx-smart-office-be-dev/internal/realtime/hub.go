package realtime

import (
	"sync"
)

// ใช้ RWMutex กันตัวแปร Map พังตอนมีคนอ่าน/เขียนพร้อมกัน
var mu sync.RWMutex
var UserClients = make(map[string]chan bool)

func AddClient(userID string, ch chan bool) {
	mu.Lock()
	defer mu.Unlock()
	UserClients[userID] = ch
}

func RemoveClient(userID string) {
	mu.Lock()
	defer mu.Unlock()
	delete(UserClients, userID)
}

func GetClient(userID string) (chan bool, bool) {
	mu.RLock()
	defer mu.RUnlock()
	ch, exists := UserClients[userID]
	return ch, exists
}

package realtime

import (
	"fmt"
	"imaxx-smart-office-be/helper"
	"log"
	"os"
	"strconv"
	"time"

	"github.com/lib/pq"
)

func StartDBListener() {
	dbPort, errPort := strconv.Atoi(os.Getenv("DB_PORT"))
	helper.ErrorPanic(errPort)
	sqlInfo := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable", os.Getenv("DB_HOST"), dbPort, os.Getenv("DB_USER"), os.Getenv("DB_PASSWORD"), os.Getenv("DB_NAME"))

	listener := pq.NewListener(sqlInfo, 10*time.Second, time.Minute, func(ev pq.ListenerEventType, err error) {
		if err != nil {
			log.Println("Listener error:", err)
		}
	})

	err := listener.Listen("leave_updates")
	if err != nil {
		panic(err) // ถ้าพัง ให้พังไปเลยตั้งแต่ตอนเปิดเซิร์ฟเวอร์
	}

	log.Println("Ready. Listening for 'leave_updates' from database...")

	go func() {
		for {
			select {
			case n := <-listener.Notify:
				if n == nil {
					continue
				}

				payload := n.Extra

				if payload == "refresh_all" {
					// กรณีต้องการกระจายให้ทุกคน (Broadcast)
					mu.RLock() // ใช้ RLock เพื่อความปลอดภัยในการอ่าน Map พร้อมกัน
					for _, clientChan := range UserClients {
						// ใช้ select default เพื่อป้องกัน Listener ค้างหากบาง Channel เต็ม
						select {
						case clientChan <- true:
						default:
						}
					}
					mu.RUnlock()
				} else {
					// กรณีเดิม: แจ้งเตือนเฉพาะรายบุคคล (หาก payload เป็น userID)
					if clientChan, exists := GetClient(payload); exists {
						select {
						case clientChan <- true:
						default:
						}
					}
				}
			}
		}
	}()
}

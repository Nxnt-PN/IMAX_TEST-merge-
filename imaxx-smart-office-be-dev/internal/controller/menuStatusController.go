package controller

import (
	"imaxx-smart-office-be/helper"
	"imaxx-smart-office-be/internal/realtime"
	"imaxx-smart-office-be/internal/response"
	"imaxx-smart-office-be/internal/service"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type MenuStatusController struct {
	menuStatusService   service.MenuStatusService
	notificationService service.NotificationService
}

func NewMenuStatusController(service service.MenuStatusService, notificationService service.NotificationService) *MenuStatusController {
	return &MenuStatusController{
		menuStatusService:   service,
		notificationService: notificationService,
	}
}

// GetMyStatus godoc
// @Summary get my menu status
// @Description get user own menu status
// @Tags menustatuses
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.DefaultResponse
// @Failure 401 {object} response.DefaultResponse
// @Router /menu-status/my [get]
func (controller *MenuStatusController) GetMyStatus(ctx *gin.Context) {
	userID, _ := ctx.MustGet("user_id").(uuid.UUID)
	resp, err := controller.menuStatusService.GetMyStatus(userID)
	if err != nil {
		// Server Error (500)
		// log.Printf("Unexpected Error: %v", err)
		ctx.JSON(http.StatusInternalServerError, response.DefaultResponse{
			Status:  "error",
			Message: "เกิดข้อผิดพลาด",
			Data: gin.H{
				"errors": err.Error(),
			},
		})
		return
	}
	ctx.JSON(http.StatusOK, response.DefaultResponse{
		Status:  "success",
		Message: "เรียกข้อมูลเรียบร้อย",
		Data:    resp,
	})
}

func (controller *MenuStatusController) GetMyStatusWS(ctx *gin.Context) {
	// ดึง UUID ออกมาแล้วแปลงเป็น String
	userID := ctx.MustGet("user_id").(uuid.UUID)
	userIDStr := userID.String()
	// paginate
	var pagination helper.Pagination
	ctx.ShouldBindQuery(&pagination)
	if pagination.Page == 0 {
		pagination = pagination.NewPagination("created_at desc")
	}

	// อัปเกรดเป็น WebSocket
	conn, err := realtime.Upgrader.Upgrade(ctx.Writer, ctx.Request, nil)
	if err != nil {
		log.Println("Upgrade error:", err)
		return
	}

	// สร้าง Channel และเอาไปฝากไว้ที่ส่วนกลาง (Hub)
	updateChan := make(chan bool)
	realtime.AddClient(userIDStr, updateChan)

	// ล้างขยะตอนจบ
	defer func() {
		realtime.RemoveClient(userIDStr)
		close(updateChan)
		conn.Close() // ปิด
	}()

	// สร้าง Goroutine เล็กๆ ไว้คอยอ่านฝั่ง Client
	// กรณีผู้ใช้ผู้ใช้ปิดหน้าเว็บ ฟังก์ชัน ReadMessage จะพ่น error ออกมา
	go func() {
		for {
			// เช็คสถานะ Connection
			if _, _, err := conn.ReadMessage(); err != nil {
				// พอ error ก็จบ Goroutine นี้
				// (โค้ดฝั่ง Write จะพังตามแล้วเข้า defer)
				break
			}
		}
	}()

	// initial data
	initMyTask, err1 := controller.menuStatusService.GetMyStatus(userID)
	if err1 != nil {
		log.Println("GetMyStatus Error:", err1)
	}

	initNoti, err2 := controller.notificationService.FindUnreadAll(pagination, userID)
	if err2 != nil {
		log.Println("GetUnreadCount Error:", err2)
	}

	if initMyTask != nil {
		err = conn.WriteJSON(gin.H{
			"type": "notification_alert",
			"payload": gin.H{
				"menu_counter": initMyTask,
				"noti_unread":  initNoti,
			},
		})
		if err != nil {
			log.Println("Initial Write Error:", err)
			return
		}
	}

	// wait for trigger from go routine
	for {
		select {
		case <-updateChan:
			// โดน Listener สะกิดมา สั่งดึงข้อมูลใหม่
			newMytask, err := controller.menuStatusService.GetMyStatus(userID)
			newNoti, err := controller.notificationService.FindUnreadAll(pagination, userID)
			if err != nil {
				// หากดึงพลาด ส่ง error กลับไปบอก Client
				conn.WriteJSON(gin.H{"status": "error", "message": "ดึงข้อมูลใหม่ล้มเหลว"})
				continue // ข้ามไปรอรอบใหม่ ไม่ต้องหยุดการทำงาน
			}

			// ยิงกลับไป Frontend
			err = conn.WriteJSON(gin.H{
				"type": "notification_alert",
				"payload": gin.H{
					"menu_counter": newMytask,
					"noti_unread":  newNoti,
				},
			})

			// กำลังจะส่งข้อมูล แต่เน็ต Client หลุพอดี
			// WriteJSON พ่น error ออกมา และหยุด loop
			if err != nil {
				log.Println("ส่งข้อมูลไม่สำเร็จ Client หายไปแล้ว:", err)
				return // สั่ง return วิ่งไปหา defer ด้านบนเพื่อล้างข้อมูล
			}
		}
	}
}

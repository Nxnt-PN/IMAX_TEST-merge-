package realtime

import (
	"net/http"

	"github.com/gorilla/websocket"
)

var Upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // ตรงนี้ไปแก้ให้รับเฉพาะ Domain ของคุณตอนขึ้น Prod ด้วย
	},
}

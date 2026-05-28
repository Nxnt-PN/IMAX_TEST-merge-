package controller

import (
	"bytes"
	"fmt"
	"net/http"
	"sort"
	"strconv"
	"strings"
	"time"

	"imaxx-smart-office-be/internal/pettycash/model"
	_ "imaxx-smart-office-be/internal/pettycash/response"

	"github.com/gin-gonic/gin"
	"github.com/go-pdf/fpdf"
)

// ─── Palette ──────────────────────────────────────────────────────────────────

const (
	clrHeaderBg = "#1A3557" // dark navy — header bar
	clrAccent   = "#2563A8" // mid-blue  — section titles / accents
	clrLightBg  = "#F7F9FC" // near-white — cell backgrounds
	clrBorder   = "#C8D4E8" // light-blue border
	clrDark     = "#111827" // near-black text
	clrMuted    = "#4B5563" // grey  text
	clrWhite    = "#FFFFFF"
	clrTableAlt = "#EDF2FA" // alternate row

	marginLR = 14.0
	marginTB = 14.0
	pageW    = 210.0
	pageH    = 297.0
	contW    = pageW - 2*marginLR // 182 mm
)

// ─── Color helpers ────────────────────────────────────────────────────────────

func hexToRGB(hex string) (int, int, int) {
	hex = strings.TrimPrefix(hex, "#")
	var r, g, b int
	fmt.Sscanf(hex, "%02x%02x%02x", &r, &g, &b)
	return r, g, b
}

func applyFill(p *fpdf.Fpdf, hex string) {
	r, g, b := hexToRGB(hex)
	p.SetFillColor(r, g, b)
}

func applyDraw(p *fpdf.Fpdf, hex string) {
	r, g, b := hexToRGB(hex)
	p.SetDrawColor(r, g, b)
}

func applyText(p *fpdf.Fpdf, hex string) {
	r, g, b := hexToRGB(hex)
	p.SetTextColor(r, g, b)
}

// ─── Formatting helpers ───────────────────────────────────────────────────────

func moneyStr(amount int) string {
	s := strconv.FormatInt(int64(amount), 10)
	if amount < 0 {
		s = s[1:]
	}
	var out []byte
	for i, c := range s {
		if i > 0 && (len(s)-i)%3 == 0 {
			out = append(out, ',')
		}
		out = append(out, byte(c))
	}
	if amount < 0 {
		return "-" + string(out) + " THB"
	}
	return string(out) + " THB"
}

func dateStr(t time.Time) string {
	if t.IsZero() {
		return "-"
	}
	return t.Format("02/01/2006")
}

func dateTimeStr(t time.Time) string {
	if t.IsZero() {
		return "-"
	}
	return t.Format("02/01/2006 15:04")
}

func safe(s string) string {
	s = strings.TrimSpace(s)
	if s == "" {
		return "-"
	}
	return s
}

func userName(user *model.User) string {
	if user == nil {
		return "-"
	}
	name := strings.TrimSpace(user.FirstName + " " + user.LastName)
	if name == "" {
		return safe(user.Username)
	}
	return name
}

func userRole(user *model.User) string {
	if user == nil {
		return "-"
	}
	name := primaryRole(user.Roles)
	if name == "" {
		return "-"
	}
	return name
}

func userLoc(user *model.User) string {
	if user == nil || user.Location == nil {
		return "-"
	}
	return safe(user.Location.LocationName)
}

// ─── PDF setup ────────────────────────────────────────────────────────────────

func newPDF() *fpdf.Fpdf {
	p := fpdf.New("P", "mm", "A4", "")
	p.SetMargins(marginLR, marginTB, marginLR)
	p.SetAutoPageBreak(false, 0) // we manage page breaks manually
	applyDraw(p, clrBorder)
	return p
}

// ─── Section: Header bar ──────────────────────────────────────────────────────

func drawHeader(p *fpdf.Fpdf, docNo string) {
	applyFill(p, clrHeaderBg)
	p.Rect(0, 0, pageW, 24, "F")

	// Company name
	p.SetFont("Arial", "B", 12)
	applyText(p, clrWhite)
	p.SetXY(marginLR, 6.5)
	p.CellFormat(100, 7, "IMAXX SOLUTION CO., LTD.", "", 0, "L", false, 0, "")

	// Sub-line
	p.SetFont("Arial", "", 7)
	applyText(p, "#8AAECC")
	p.SetXY(marginLR, 14)
	p.CellFormat(100, 5, "Smart Office  —  Internal Finance Document", "", 0, "L", false, 0, "")

	// Document No. (right)
	p.SetFont("Arial", "", 7)
	applyText(p, "#8AAECC")
	p.SetXY(pageW-marginLR-72, 6)
	p.CellFormat(72, 5, "Document No.", "", 0, "R", false, 0, "")

	p.SetFont("Arial", "B", 10.5)
	applyText(p, clrWhite)
	p.SetXY(pageW-marginLR-72, 12)
	p.CellFormat(72, 7, docNo, "", 0, "R", false, 0, "")
}

// ─── Section: Document title ──────────────────────────────────────────────────

func drawTitle(p *fpdf.Fpdf) float64 {
	y := 28.0

	// Left accent bar
	applyFill(p, clrAccent)
	p.Rect(marginLR, y, 3.5, 12, "F")

	p.SetFont("Arial", "B", 14)
	applyText(p, clrDark)
	p.SetXY(marginLR+6, y+1)
	p.CellFormat(contW-6, 7, "ใบเบิกเงินสด  /  PETTY CASH REQUEST", "", 0, "L", false, 0, "")

	p.SetFont("Arial", "", 7.5)
	applyText(p, clrMuted)
	p.SetXY(marginLR+6, y+8.5)
	p.CellFormat(contW-6, 5, "เอกสารใบเบิกเงินสดสำหรับการอนุมัติภายในองค์กร", "", 0, "L", false, 0, "")

	return y + 16
}

// ─── Section: Requester info ──────────────────────────────────────────────────

func drawInfoCell(p *fpdf.Fpdf, label, value string, x, y, w float64) {
	p.SetFont("Arial", "", 6.5)
	applyText(p, clrMuted)
	p.SetXY(x, y)
	p.CellFormat(w, 4.5, label, "", 1, "L", false, 0, "")

	p.SetFont("Arial", "B", 8.5)
	applyText(p, clrDark)
	p.SetXY(x, y+4.5)
	p.CellFormat(w, 5.5, value, "", 0, "L", false, 0, "")
}

func drawRequester(p *fpdf.Fpdf, form *model.PettyCashForm, startY float64) float64 {
	y := startY

	// Section label
	p.SetFont("Arial", "B", 8)
	applyText(p, clrAccent)
	p.SetXY(marginLR, y)
	p.CellFormat(contW, 6, "1.  ข้อมูลผู้ขอเบิก  /  REQUESTER INFORMATION", "", 0, "L", false, 0, "")
	y += 7

	// Box
	applyFill(p, clrLightBg)
	applyDraw(p, clrBorder)
	p.Rect(marginLR, y, contW, 44, "FD")

	col := contW / 3

	// Row 1: requester / role / location
	drawInfoCell(p, "ผู้ขอเบิก / Requester", userName(form.User), marginLR+3, y+3.5, col-4)
	drawInfoCell(p, "ตำแหน่ง / Role", userRole(form.User), marginLR+col+3, y+3.5, col-4)
	drawInfoCell(p, "สาขา / Location", userLoc(form.User), marginLR+col*2+3, y+3.5, col-4)

	// Divider
	applyDraw(p, clrBorder)
	p.Line(marginLR+2, y+22, marginLR+contW-2, y+22)

	// Row 2: created / status / doc no
	drawInfoCell(p, "วันที่สร้าง / Created", dateTimeStr(form.CreatedAt), marginLR+3, y+25, col-4)
	drawInfoCell(p, "สถานะ / Status", "สำเร็จแล้ว / Completed", marginLR+col+3, y+25, col-4)
	drawInfoCell(p, "เลขที่เอกสาร / Doc No.", safe(form.DocumentNo), marginLR+col*2+3, y+25, col-4)

	y += 46

	// Title + total row
	applyFill(p, clrLightBg)
	applyDraw(p, clrBorder)
	p.Rect(marginLR, y, contW, 19, "FD")

	// Vertical divider
	applyDraw(p, clrBorder)
	p.Line(marginLR+contW*0.62, y, marginLR+contW*0.62, y+19)

	drawInfoCell(p, "หัวข้อ / Title", safe(form.Title), marginLR+3, y+3, contW*0.62-5)

	// Grand total (right cell)
	p.SetFont("Arial", "", 6.5)
	applyText(p, clrMuted)
	p.SetXY(marginLR+contW*0.62+3, y+3)
	p.CellFormat(contW*0.38-5, 4.5, "ยอดรวมสุทธิ / Grand Total", "", 0, "L", false, 0, "")

	p.SetFont("Arial", "B", 13.5)
	applyText(p, clrAccent)
	p.SetXY(marginLR+contW*0.62+3, y+9)
	p.CellFormat(contW*0.38-5, 8, moneyStr(form.TotalAmount), "", 0, "R", false, 0, "")

	return y + 22
}

// ─── Section: Items table ─────────────────────────────────────────────────────

func drawItemsTable(p *fpdf.Fpdf, form *model.PettyCashForm, startY float64) float64 {
	y := startY

	p.SetFont("Arial", "B", 8)
	applyText(p, clrAccent)
	p.SetXY(marginLR, y)
	p.CellFormat(contW, 6, "2.  รายการค่าใช้จ่าย  /  EXPENSE DETAILS", "", 0, "L", false, 0, "")
	y += 7

	colW := [6]float64{10, 24, 44, 54, 32, 18}
	colHdr := [6]string{"#", "วันที่\nDate", "โครงการ\nProject", "รายละเอียด\nDescription", "ประเภท\nCategory", "จำนวน\nAmount"}
	colAln := [6]string{"C", "C", "L", "L", "L", "R"}

	// ── Header row
	applyFill(p, clrHeaderBg)
	p.Rect(marginLR, y, contW, 13, "F")

	x := marginLR
	for i, w := range colW {
		parts := strings.SplitN(colHdr[i], "\n", 2)
		p.SetFont("Arial", "B", 7.5)
		applyText(p, clrWhite)
		p.SetXY(x+1, y+2)
		p.CellFormat(w-2, 5, parts[0], "", 1, colAln[i], false, 0, "")
		if len(parts) == 2 {
			p.SetFont("Arial", "", 6.5)
			applyText(p, "#8AAECC")
			p.SetXY(x+1, y+7)
			p.CellFormat(w-2, 4, parts[1], "", 0, colAln[i], false, 0, "")
		}
		x += w
	}

	// Column dividers in header
	applyDraw(p, "#2A5080")
	x = marginLR
	for _, w := range colW[:5] {
		x += w
		p.Line(x, y+1, x, y+12)
	}
	y += 13

	// ── Data rows
	if len(form.Items) == 0 {
		applyFill(p, clrLightBg)
		applyDraw(p, clrBorder)
		p.Rect(marginLR, y, contW, 10, "FD")
		p.SetFont("Arial", "", 8.5)
		applyText(p, clrMuted)
		p.SetXY(marginLR, y+2)
		p.CellFormat(contW, 6, "ไม่มีรายการค่าใช้จ่าย  /  No expense items", "", 0, "C", false, 0, "")
		y += 10
	} else {
		for i, item := range form.Items {
			project := "-"
			category := "-"
			if item.Project != nil && item.Project.ProjectName != "" {
				project = item.Project.ProjectName
			}
			if item.Reason != nil && item.Reason.ReasonName != "" {
				category = item.Reason.ReasonName
			}

			rowBg := clrWhite
			if i%2 == 1 {
				rowBg = clrTableAlt
			}
			rowH := 9.5
			applyFill(p, rowBg)
			applyDraw(p, clrBorder)
			p.Rect(marginLR, y, contW, rowH, "FD")

			vals := [6]string{
				fmt.Sprintf("%d", i+1),
				dateStr(item.Date),
				project,
				safe(item.Description),
				category,
				moneyStr(item.Total),
			}
			x = marginLR
			for j, w := range colW {
				if j == 0 {
					p.SetFont("Arial", "B", 8)
					applyText(p, clrMuted)
				} else if j == 5 {
					p.SetFont("Arial", "B", 8)
					applyText(p, clrDark)
				} else {
					p.SetFont("Arial", "", 8.5)
					applyText(p, clrDark)
				}
				p.SetXY(x+1.5, y+1.8)
				p.CellFormat(w-3, rowH-3.5, vals[j], "", 0, colAln[j], false, 0, "")
				x += w
			}
			y += rowH
		}
	}

	// ── Grand total footer row
	applyFill(p, clrHeaderBg)
	p.Rect(marginLR+contW-52, y, 52, 11, "F")

	p.SetFont("Arial", "", 7.5)
	applyText(p, "#8AAECC")
	p.SetXY(marginLR+contW-52, y+2)
	p.CellFormat(25, 5, "รวมทั้งสิ้น", "", 0, "C", false, 0, "")

	p.SetFont("Arial", "B", 10)
	applyText(p, clrWhite)
	p.SetXY(marginLR+contW-27, y+1.5)
	p.CellFormat(25, 7, moneyStr(form.TotalAmount), "", 0, "R", false, 0, "")

	return y + 14
}

// ─── Section: Approval history ────────────────────────────────────────────────

func drawHistory(p *fpdf.Fpdf, form *model.PettyCashForm, startY float64) float64 {
	y := startY

	p.SetFont("Arial", "B", 8)
	applyText(p, clrAccent)
	p.SetXY(marginLR, y)
	p.CellFormat(contW, 6, "3.  ประวัติการอนุมัติ  /  APPROVAL RECORD", "", 0, "L", false, 0, "")
	y += 7

	colW := [4]float64{34, 52, 38, 58}
	colHdr := [4]string{"การดำเนินการ\nAction", "ผู้ดำเนินการ\nBy", "วันที่-เวลา\nDate & Time", "หมายเหตุ\nRemark"}
	colAln := [4]string{"C", "L", "C", "L"}

	// Header
	applyFill(p, clrHeaderBg)
	p.Rect(marginLR, y, contW, 13, "F")

	x := marginLR
	for i, w := range colW {
		parts := strings.SplitN(colHdr[i], "\n", 2)
		p.SetFont("Arial", "B", 7.5)
		applyText(p, clrWhite)
		p.SetXY(x+1, y+2)
		p.CellFormat(w-2, 5, parts[0], "", 1, colAln[i], false, 0, "")
		if len(parts) == 2 {
			p.SetFont("Arial", "", 6.5)
			applyText(p, "#8AAECC")
			p.SetXY(x+1, y+7)
			p.CellFormat(w-2, 4, parts[1], "", 0, colAln[i], false, 0, "")
		}
		x += w
	}
	applyDraw(p, "#2A5080")
	x = marginLR
	for _, w := range colW[:3] {
		x += w
		p.Line(x, y+1, x, y+12)
	}
	y += 13

	// Rows
	history := append([]model.PettyCashHistory(nil), form.History...)
	sort.Slice(history, func(i, j int) bool {
		return history[i].CreatedAt.Before(history[j].CreatedAt)
	})

	if len(history) == 0 {
		applyFill(p, clrLightBg)
		applyDraw(p, clrBorder)
		p.Rect(marginLR, y, contW, 9, "FD")
		p.SetFont("Arial", "", 8.5)
		applyText(p, clrMuted)
		p.SetXY(marginLR, y+1.5)
		p.CellFormat(contW, 6, "ไม่มีประวัติการอนุมัติ  /  No approval history", "", 0, "C", false, 0, "")
		y += 9
	} else {
		for i, item := range history {
			rowBg := clrWhite
			if i%2 == 1 {
				rowBg = clrTableAlt
			}
			applyFill(p, rowBg)
			applyDraw(p, clrBorder)
			p.Rect(marginLR, y, contW, 9, "FD")

			vals := [4]string{
				strings.ToUpper(safe(item.Action)),
				userName(item.User),
				dateTimeStr(item.CreatedAt),
				safe(item.Remark),
			}
			x = marginLR
			for j, w := range colW {
				switch j {
				case 0:
					p.SetFont("Arial", "B", 8)
					applyText(p, clrAccent)
				default:
					p.SetFont("Arial", "", 8.5)
					applyText(p, clrDark)
				}
				p.SetXY(x+1.5, y+2)
				p.CellFormat(w-3, 5, vals[j], "", 0, colAln[j], false, 0, "")
				x += w
			}
			y += 9
		}
	}

	return y + 6
}

// ─── Section: Signature block (dynamic — follows workflow steps) ───────────────

type sigBox struct {
	label string // step name / role
	name  string // actual person who signed
}

// buildSignerBoxes returns [requester] + one box per WorkflowDetail (sorted by Seq),
// each mapped to the corresponding "approved" history entry in chronological order.
func buildSignerBoxes(form *model.PettyCashForm) []sigBox {
	boxes := []sigBox{
		{label: "ผู้ขอเบิก  /  Requested By", name: userName(form.User)},
	}

	// Workflow steps sorted by Seq
	var steps []model.WorkflowDetail
	if form.Workflow != nil {
		steps = append(steps, form.Workflow.Details...)
		sort.Slice(steps, func(i, j int) bool { return steps[i].Seq < steps[j].Seq })
	}

	// Approved history sorted chronologically
	var approved []model.PettyCashHistory
	for _, h := range form.History {
		if strings.EqualFold(strings.TrimSpace(h.Action), "approved") {
			approved = append(approved, h)
		}
	}
	sort.Slice(approved, func(i, j int) bool {
		return approved[i].CreatedAt.Before(approved[j].CreatedAt)
	})

	// One box per workflow step
	for i, step := range steps {
		label := strings.TrimSpace(step.Name)
		if label == "" {
			label = fmt.Sprintf("ผู้อนุมัติขั้นที่ %d", step.Seq)
		}
		if step.Role != nil && step.Role.Name != "" {
			label = label + "  /  " + step.Role.Name
		}

		name := "─────────────" // not yet approved
		if i < len(approved) && approved[i].User != nil {
			name = userName(approved[i].User)
		}
		boxes = append(boxes, sigBox{label: label, name: name})
	}

	// Fallback when no workflow configured
	if len(steps) == 0 {
		name := "─────────────"
		if len(approved) > 0 && approved[0].User != nil {
			name = userName(approved[0].User)
		}
		boxes = append(boxes, sigBox{label: "ผู้อนุมัติ  /  Approved By", name: name})
	}

	return boxes
}

func drawSignatures(p *fpdf.Fpdf, form *model.PettyCashForm, y float64) {
	boxes := buildSignerBoxes(form)
	n := len(boxes)
	gap := 5.0
	boxW := (contW - gap*float64(n-1)) / float64(n)
	boxH := 30.0

	for i, box := range boxes {
		x := marginLR + float64(i)*(boxW+gap)

		applyFill(p, clrLightBg)
		applyDraw(p, clrBorder)
		p.Rect(x, y, boxW, boxH, "FD")

		// Step label (top-left)
		p.SetFont("Arial", "", 6.5)
		applyText(p, clrMuted)
		p.SetXY(x+3, y+3)
		p.CellFormat(boxW-6, 4.5, box.label, "", 0, "L", false, 0, "")

		// Person name (centered)
		p.SetFont("Arial", "B", 8.5)
		applyText(p, clrDark)
		p.SetXY(x+3, y+9)
		p.CellFormat(boxW-6, 5.5, box.name, "", 0, "C", false, 0, "")

		// Signature line
		applyDraw(p, "#A0AABB")
		p.Line(x+8, y+21, x+boxW-8, y+21)

		// Caption below line
		p.SetFont("Arial", "", 6)
		applyText(p, clrMuted)
		p.SetXY(x+3, y+22.5)
		p.CellFormat(boxW-6, 4.5, "ลายเซ็น  /  Signature & Date", "", 0, "C", false, 0, "")
	}
}

// ─── Footer on every page ─────────────────────────────────────────────────────

func drawFooters(p *fpdf.Fpdf) {
	total := p.PageCount()
	for pg := 1; pg <= total; pg++ {
		p.SetPage(pg)

		applyDraw(p, clrBorder)
		p.Line(marginLR, pageH-11, pageW-marginLR, pageH-11)

		p.SetFont("Arial", "", 6.5)
		applyText(p, clrMuted)
		p.SetXY(marginLR, pageH-9)
		p.CellFormat(contW/2, 5, "Smart Office  —  IMAXX SOLUTION CO., LTD.", "", 0, "L", false, 0, "")

		p.SetXY(marginLR+contW/2, pageH-9)
		p.CellFormat(contW/2, 5,
			fmt.Sprintf("พิมพ์เมื่อ %s  |  หน้า %d / %d", time.Now().Format("02/01/2006 15:04"), pg, total),
			"", 0, "R", false, 0, "")
	}
}

// ─── Main builder ─────────────────────────────────────────────────────────────

func buildPettyCashPDF(form *model.PettyCashForm) []byte {
	docNo := form.DocumentNo
	if docNo == "" {
		docNo = "PC-" + form.ID.String()[:8]
	}

	p := newPDF()
	p.AddPage()

	drawHeader(p, docNo)
	y := drawTitle(p)
	y += 2
	y = drawRequester(p, form, y)
	y += 5
	y = drawItemsTable(p, form, y)
	y += 5

	// Page break if not enough space for history + signatures
	if y > pageH-90 {
		p.AddPage()
		drawHeader(p, docNo)
		y = 30
	}

	y = drawHistory(p, form, y)
	y += 5

	// Page break if not enough space for signatures
	if y > pageH-55 {
		p.AddPage()
		drawHeader(p, docNo)
		y = 30
	}

	drawSignatures(p, form, y)
	drawFooters(p)

	var buf bytes.Buffer
	_ = p.Output(&buf)
	return buf.Bytes()
}

// ─── HTTP Handler ─────────────────────────────────────────────────────────────

// DownloadPDF godoc
// @Summary      Download petty cash PDF
// @Description  Download a completed petty cash request as a PDF file.
// @Tags         Petty Cash
// @Produce      application/pdf
// @Security     BearerAuth
// @Param        id   path      string  true  "Petty cash form ID (UUID)"
// @Success      200  {file}    binary
// @Failure      403  {object}  response.ErrorResponse
// @Failure      404  {object}  response.ErrorResponse
// @Router       /api/pettycash/{id}/pdf [get]
func (c *PettyCashController) DownloadPDF(ctx *gin.Context) {
	id := ctx.Param("id")
	form, err := c.pettyCashService.GetPettyCashByID(id)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	user, ok := currentUserWithRoles(ctx, c.db)
	if !ok {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	if !userHasPermission(user, PermissionExportPettyCashReport) &&
		!(form.UserID == user.ID && userHasPermission(user, PermissionViewPettyCash)) {
		abortForbidden(ctx)
		return
	}
	if form.State != 3 {
		ctx.JSON(http.StatusForbidden, gin.H{"error": "PDF is available only for completed petty cash requests"})
		return
	}
	fileName := form.DocumentNo
	if fileName == "" {
		fileName = "petty-cash-" + form.ID.String()
	}
	ctx.Header("Content-Type", "application/pdf")
	ctx.Header("Content-Disposition", fmt.Sprintf(`attachment; filename="%s.pdf"`, fileName))
	ctx.Data(http.StatusOK, "application/pdf", buildPettyCashPDF(form))
}

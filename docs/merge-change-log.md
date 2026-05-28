# Merge Change Log

เอกสารนี้เป็น change log บังคับสำหรับงานรวม IMAX_MAIN เข้า Origin repo

ทุก PR/branch ที่เพิ่ม แก้ไข หรือลบไฟล์ ต้องเพิ่ม section ในไฟล์นี้ก่อน commit เพื่อให้เห็นชัดว่า:

- เพิ่มหรือแก้อะไร
- เพิ่มหรือแก้ตรงไหน
- ของเดิมเป็นอะไร
- ของใหม่เป็นอะไร
- ทำหน้าที่อะไร
- ทดสอบอะไรแล้ว

## PR 0: Setup Safety

Branch: `feature/pettycash-00-setup`  
Commit: `chore: prepare merge workspace ignores and changelog`

### Summary

เพิ่มกติกา change documentation กลางของ repo, เสริม ignore rules สำหรับไฟล์ local/runtime/cache และเพิ่มคู่มือมนุษย์อ่านสำหรับงานรวม IMAX_MAIN เข้า Origin ก่อนเริ่มรวม logic จริง

### Files Changed

| File/Area | Type | Before | After | Purpose |
|---|---|---|---|---|
| `.gitignore` | Modified | มี ignore พื้นฐานสำหรับ `.env`, dependencies, build output, cache, logs, reports และ runtime files | เพิ่ม ignore สำหรับ local/cache/runtime เพิ่มเติม เช่น `*.local`, `coverage/`, `.gocache-local/`, `.cache/`, `coverage.out`, `docker-tmp/`, `docker-temp`, `*.tmp`, `~$*.docx` | ลดความเสี่ยง commit ไฟล์ local/cache/runtime และ temp file จาก Word ระหว่าง merge |
| `imaxx-smart-office-be-dev/.gitignore` | Modified | มี Go binary/test/env/upload/tmp ignore พื้นฐาน | เพิ่ม env variants, Go cache, logs, coverage และ docker tmp | กันไฟล์ runtime/backend cache หลุดเข้า commit |
| `imaxx-smart-office-fe-dev/.gitignore` | Modified | มี frontend logs, node_modules, dist, Playwright และ `.env` | เพิ่ม env variants, npm/vite/cache, coverage และ build output | กันไฟล์ frontend local/build/test cache หลุดเข้า commit |
| `docs/merge-change-log.md` | Added/Modified | ยังไม่มีเอกสารกลางสำหรับบันทึกการเปลี่ยนแปลงราย PR | เพิ่ม change log template และบันทึก PR 0 พร้อมรายการเอกสารที่เพิ่ม | บังคับให้ทุก PR อธิบาย before/after/purpose/test ก่อน commit |
| `docs/merge-human-guide.md` | Added | ยังไม่มีคู่มือภาพรวมสำหรับคนที่ไม่อ่านโค้ด | เพิ่มคู่มือภาษาไทยอธิบาย Origin, IMAX_MAIN, เหตุผลที่แบ่ง PR, ลำดับ PR, วิธีอ่าน change log และจุดเสี่ยง | ทำให้คนไม่ technical เข้าใจแผนรวม และให้ reviewer technical เห็นบริบทเดียวกัน |
| `docs/merge-human-guide.docx` | Added | ยังไม่มีไฟล์เอกสารเปิดอ่านแบบ Word | เพิ่ม DOCX จากเนื้อหาเดียวกับ Markdown | ใช้ส่งต่อ/เปิดอ่านง่ายสำหรับทีมที่ไม่อ่าน Markdown |

### Behavior Impact

- ไม่มี API/route/schema/permission/workflow change
- ไม่มี production logic change
- เพิ่มเฉพาะ repository hygiene และ documentation rule
- เพิ่มเอกสารช่วยอธิบายแผนรวมสำหรับทั้งคนทั่วไปและคน technical

### Tests Run

- `git status --short`
- ตรวจว่าไม่มีไฟล์ secret/cache/build/runtime ถูก track อยู่
- เปิด DOCX ด้วย python-docx เพื่อตรวจว่าไฟล์สร้างสำเร็จและมีโครงสร้างอ่านได้

### Rollback Note

- ถ้าต้องถอย PR นี้ ให้ revert `.gitignore`, `imaxx-smart-office-be-dev/.gitignore`, `imaxx-smart-office-fe-dev/.gitignore` และลบ `docs/merge-change-log.md`, `docs/merge-human-guide.md`, `docs/merge-human-guide.docx`

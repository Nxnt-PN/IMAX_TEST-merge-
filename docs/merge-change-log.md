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

## PR 1: Backend Foundation

Branch: `feature/pettycash-01-backend-foundation`  
Commit: `feat: add backend foundation for location support`

### Summary

เพิ่ม backend foundation สำหรับ Location และ user location support เพื่อเตรียม dependency ที่ Petty Cash ต้องใช้ใน PR ถัดไป โดยยังไม่เพิ่ม Petty Cash API, schema migration หรือ workflow logic

### Files Changed

| File/Area | Type | Before | After | Purpose |
|---|---|---|---|---|
| `internal/model/location.go` | Added | Origin ยังไม่มี model สำหรับ location master | เพิ่ม `Location` model ที่ผูกกับ `User` ผ่าน `LocationID` | เป็น master data สำหรับตำแหน่ง/สาขาของผู้ใช้และ Petty Cash requester |
| `internal/controller/locationController.go` | Added | ยังไม่มี endpoint handler สำหรับ location | เพิ่ม list/create/update/delete controller สำหรับ `/api/locations` | เปิด CRUD location ผ่าน response shape เดิม `DefaultResponse` |
| `internal/repository/locationRepository.go` | Added | ยังไม่มี data access layer สำหรับ location | เพิ่ม repository สำหรับ list/find/create/update/delete และ duplicate check | แยก database access ออกจาก service ตาม pattern เดิม |
| `internal/request/locationRequest.go` | Added | ยังไม่มี request DTO สำหรับ location | เพิ่ม create/update request พร้อม audit fields | ใช้รับ payload และบันทึก created/updated/deleted metadata |
| `internal/service/locationService.go` | Added | ยังไม่มี business layer สำหรับ location | เพิ่ม service สำหรับ pagination, create, update, delete และ duplicate validation | คุม logic location master ก่อนถึง repository |
| `internal/router/locationRoute.go` | Added | ยังไม่มี route group `/api/locations` | เพิ่ม authenticated route group `/api/locations` | ให้ frontend/settings และ Petty Cash ใช้ location master ได้ |
| `internal/model/user.go` | Modified | User ไม่มี `location_id` และ relation ไป location | เพิ่ม `LocationID` และ `Location` relation | ให้ user profile/response มีข้อมูล location ได้ |
| `internal/request/createUserRequest.go` / `updateUserRequest.go` | Modified | create/update user ไม่มี field `location_id` | เพิ่ม optional `location_id` | ให้ user management ส่งหรือ clear location ได้ |
| `internal/repository/userRepository.go` | Modified | user queries preload roles เท่านั้น | preload `Location` และเพิ่ม `UpdateUserLocation` | ให้ list/detail/user profile คืน location และ update location ได้ชัดเจน |
| `internal/service/userService.go` | Modified | create/update user ไม่ map location_id | parse optional location id และ update `LocationID` | เชื่อม request DTO กับ model โดยไม่เปลี่ยน role/password behavior เดิม |
| `main.go` | Modified | app wiring ไม่มี location dependency/route | wire location repository, service, controller และ router | register `/api/locations` ใน runtime |
| `loader/main.go` | Modified | Atlas GORM source ยังไม่รู้จัก `Location` | เพิ่ม `model.Location` ใน schema loader | เตรียมให้ PR schema generate/validate location table ได้ |

### Behavior Impact

- เพิ่ม route ใหม่ `/api/locations` ที่ต้องผ่าน `AuthorizeJWT`
- User response สามารถมี `location_id` และ `location` เพิ่มขึ้นเมื่อ schema พร้อม
- ยังไม่เพิ่ม migration ใน PR นี้ ดังนั้น database ที่ยังไม่มี `locations`/`users.location_id` ต้องรอ PR 2 ก่อนใช้ route นี้จริงกับ DB
- ไม่แตะ Petty Cash route/API/workflow
- ไม่เปลี่ยน Leave/User/Role workflow เดิม นอกจากรองรับ optional location field ใน user payload

### Tests Run

- `go test ./...` ไม่ผ่านเพราะ pre-existing vet issue ที่ `internal/middleware/authMiddleware.go:28` (`fmt.Errorf` มี argument แต่ไม่มี formatting directive)
- `go test -vet=off ./...` ผ่านทุก package โดยใช้ local `GOCACHE=.gocache-local`
- ยังไม่ได้ smoke `/api/locations` กับ database เพราะ schema migration อยู่ใน PR 2

### Rollback Note

- ถ้าต้องถอย PR นี้ ให้ลบ location controller/model/repository/request/router/service, ถอด location wiring ใน `main.go`, ถอด `model.Location` จาก `loader/main.go`, และ revert user location fields/preloads/service mapping


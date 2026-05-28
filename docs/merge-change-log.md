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

## PR 2: Backend Schema + Seed

Branch: `feature/pettycash-02-backend-schema`
Commit: `feat: add petty cash schema and seed data`

### Summary

เพิ่ม schema และ seed พื้นฐานสำหรับ Location/Petty Cash เพื่อเตรียมฐานข้อมูลก่อนนำ backend API เข้ามาใน PR ถัดไป โดยยังไม่เพิ่ม Petty Cash controller/service/repository หลัก และยังไม่เปลี่ยน route/API ของระบบเดิม

### Files Changed

| File/Area | Type | Before | After | Purpose |
|---|---|---|---|---|
| `migrations/20260522000100_add_pettycash_module.sql` | Added | Origin ยังไม่มีตาราง Petty Cash | เพิ่มตาราง project, reason, form, item, attachment, history | เตรียม schema สำหรับคำขอเบิกเงินสด |
| `migrations/20260525090000_add_locations_user_location.sql` | Added | ยังไม่มีตาราง locations และ `users.location_id` | เพิ่ม `locations` และ foreign key จาก users | รองรับ user location และข้อมูลผู้ขอเบิก |
| `migrations/20260527163000_extend_pettycash_attachment_file_path.sql` | Added | `petty_cash_attachments.file_path` ยาว 100 | ขยายเป็น varchar(500) | รองรับ path ไฟล์แนบที่ยาวขึ้น |
| `migrations/atlas.sum` | Modified | checksum ยังไม่มี migration ใหม่ | เพิ่ม checksum ของ migration ใหม่ | ให้ Atlas ตรวจ migration chain ได้ถูกต้อง |
| `atlas.hcl` | Modified | มีเฉพาะ env `gorm` และยังไม่ผูก `DATABASE_URL` | เพิ่ม `local` env, `DATABASE_URL`, dev database Postgres 16 และ destructive lint | ทำให้ migration workflow ตรงกับ IMAX_MAIN |
| `scripts/atlas.cmd`, `scripts/atlas.ps1`, `scripts/atlas-env.cmd`, `scripts/atlas-env.ps1` | Added | Origin ไม่มี helper scripts สำหรับ Atlas | เพิ่ม script สำหรับเรียก Atlas และตั้งค่า local env | ลดการพิมพ์ config/database URL โดยตรง |
| `enums/system.go` | Modified | มีเฉพาะ `leave_system` | เพิ่ม `PettyCashSystemSlug = "petty-cash"` | ใช้อ้างอิงระบบ Petty Cash ใน seed/workflow |
| `internal/seed/seedUser.go` | Modified | seed permission/role มีเฉพาะระบบเดิม | เพิ่ม permission Petty Cash, role Finance และ role permission grants | เตรียมสิทธิ์ requester/approver/report/master data |
| `internal/seed/seedWorkflow.go` | Modified | seed เฉพาะ Leave workflow/system | เพิ่ม Petty Cash workflow, workflow detail และ system seed | เตรียม workflow รอ Finance approve |
| `internal/seed/seedPettyCash.go` | Added | ยังไม่มี seed master data Petty Cash | เพิ่ม seed project/reason master data แบบ raw DB table | เตรียม master data โดยไม่ต้อง import Petty Cash model ก่อน PR3 |
| `main.go` | Modified | seed flow เรียก user/workflow/leave quota | เพิ่ม `SeedPettyCash` หลัง workflow | ให้ seed master data Petty Cash ทำงานเมื่อรัน `-seed=t` |

### Behavior Impact

- เพิ่ม schema ใหม่สำหรับ Location และ Petty Cash เมื่อ apply migration
- เพิ่ม permission names: `view_pettycash`, `create_pettycash`, `edit_pettycash`, `delete_pettycash`, `save_pettycash`, `submit_pettycash`, `approve_pettycash`, `reject_pettycash`, `cancel_pettycash`, `resend_pettycash`, `view_pettycash_report`, `export_pettycash_report`, `manage_pettycash_master`
- เพิ่ม role `Finance` และผูก admin เข้ากับ Finance เพื่อให้ seed/workflow ทดสอบต่อได้
- เพิ่ม Petty Cash workflow แบบ 1 step: `Waiting for Finance Approve`
- ตั้งใจยังไม่เพิ่ม Petty Cash API/controller/service/repository หลักใน PR นี้
- `SeedPettyCash` รอบนี้ seed เฉพาะ project/reason master data ด้วย raw SQL เพื่อไม่ให้ compile พังจาก model ที่จะเข้ามาใน PR3

### Tests Run

- `go test -vet=off ./...` ผ่านทุก package โดยใช้ local `GOCACHE=.gocache-local`
- `go test ./...` ยังไม่ผ่านจาก pre-existing vet issue ที่ `internal/middleware/authMiddleware.go:28`
- `scripts\atlas.cmd migrate lint --env local --latest 1` ยังรันไม่ได้ เพราะเครื่องไม่มี `atlas` CLI หรือ `tools/atlas/atlas.exe` ใน PATH
- ยังไม่ได้ apply/dry-run migration กับ database จริง เพราะ Atlas CLI ยังไม่พร้อมใน workspace นี้

### Rollback Note

- ถ้าต้องถอย PR นี้ ให้ถอด migration ใหม่ทั้ง 3 ไฟล์และ checksum ใน `atlas.sum`, revert `atlas.hcl`/scripts, revert seed user/workflow/system slug/main seed call และลบ `seedPettyCash.go`

## PR 3: Backend Petty Cash Core API

Branch: `feature/pettycash-03-backend-core`
Commit: `feat: add petty cash backend API`

### Summary

เพิ่ม backend module หลักของ Petty Cash สำหรับ list/detail/create/update/master data/upload/PDF โดย register route `/api/pettycash` แล้ว แต่ยังไม่เปิด workflow action routes ได้แก่ submit, approve, reject, cancel, resend ซึ่งจะแยกไป PR 4

### Files Changed

| File/Area | Type | Before | After | Purpose |
|---|---|---|---|---|
| `internal/pettycash/model/**` | Added | Origin ยังไม่มี model เฉพาะ Petty Cash | เพิ่ม model สำหรับ form, item, attachment, history, project, reason และ model support ที่ต้อง preload | ให้ repository/service map กับ schema ที่เพิ่มใน PR2 ได้ |
| `internal/pettycash/repository/**` | Added | ยังไม่มี data access layer ของ Petty Cash | เพิ่ม repository สำหรับ list/count/detail/create/update/project/reason/history/upload relation | แยก database query ของ Petty Cash ออกจาก controller/service |
| `internal/pettycash/request/**` | Added | ยังไม่มี request DTO ของ Petty Cash | เพิ่ม DTO สำหรับ create/update/action/project/reason | รับ payload จาก frontend โดยคง API contract ของ IMAX_MAIN |
| `internal/pettycash/response/**` | Added | ยังไม่มี response DTO ของ Petty Cash | เพิ่ม response shape สำหรับ list/summary/pagination/upload | ให้ controller ส่ง response shape ที่ frontend ใช้อยู่ |
| `internal/pettycash/service/**` | Added | ยังไม่มี business logic ของ Petty Cash | เพิ่ม service สำหรับ read/write/core helpers และ workflow methods ที่ยังไม่ expose route ใน PR นี้ | รองรับ core API และเตรียม reuse สำหรับ PR4 |
| `internal/pettycash/controller/**` | Added | ยังไม่มี controller ของ Petty Cash | เพิ่ม controller สำหรับ list/detail/create/update/history/summary/project/reason/upload/pdf และ permission helper | เปิด backend handler ของ Petty Cash โดยคุม permission ตาม seed |
| `internal/router/pettycashRoute.go` | Added | ยังไม่มี route group `/api/pettycash` | เพิ่ม route group สำหรับ core endpoints เท่านั้น | เปิด API core โดยยังไม่เปิด workflow action routes |
| `main.go` | Modified | runtime ยังไม่ได้ register Petty Cash router | เพิ่ม `router.NewPettycashRouter(baseRouter, db)` | ให้ backend serve `/api/pettycash...` |
| `loader/main.go` | Modified | Atlas GORM source ยังไม่รู้จัก Petty Cash schema | เพิ่ม GORM schema structs ของ Petty Cash ใน loader | ให้ Atlas schema source สอดคล้องกับ migration |
| `go.mod` / `go.sum` | Modified | ยังไม่มี dependency PDF generator ที่ Petty Cash PDF ใช้ | เพิ่ม `github.com/go-pdf/fpdf v0.9.0` | รองรับ PDF download endpoint |

### Behavior Impact

- เพิ่ม route group `/api/pettycash`
- เปิด core endpoints: projects, reasons, list, detail, create, update, history, summary, upload, PDF
- ยังไม่เปิด routes: `/submit/:id`, `/approve/:id`, `/reject/:id`, `/cancel/:id`, `/resend/:id`
- ไม่เพิ่ม Thai font assets ใน PR นี้ และ PDF ใช้ standard font เพื่อเลี่ยงไฟล์ font ใหญ่/ปัญหา layout ที่เคยเจอ
- ไม่แตะ menu badge/task count ใน PR นี้ เพราะจะรวมกับ workflow ใน PR4
- ไม่เปลี่ยน Leave/User/Role route เดิม

### Tests Run

- `go test -vet=off ./...` ผ่านทุก package โดยใช้ local `GOCACHE=.gocache-local`
- `go test ./...` ยังไม่ผ่านจาก pre-existing vet issue ที่ `internal/middleware/authMiddleware.go:28`
- ยังไม่ได้ smoke API กับ database จริงในรอบนี้ เพราะต้องมี migration/seed apply ใน environment ก่อน

### Rollback Note

- ถ้าต้องถอย PR นี้ ให้ลบ `internal/pettycash/**`, `internal/router/pettycashRoute.go`, ถอด `router.NewPettycashRouter` จาก `main.go`, revert Petty Cash structs ใน `loader/main.go`, และถอด `github.com/go-pdf/fpdf` จาก `go.mod`/`go.sum`


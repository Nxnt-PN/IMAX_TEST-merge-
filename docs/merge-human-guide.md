# คู่มือการรวม IMAX_MAIN เข้า Origin Repo

เอกสารนี้ทำไว้ให้คนอ่านเข้าใจระบบ ไม่ว่าจะเขียนโค้ดเป็นหรือไม่เป็น คนที่ไม่ technical ควรเข้าใจว่าเรากำลังรวมอะไรและทำไมต้องทำเป็นขั้น ๆ ส่วนคน technical ควรอ่านแล้วเห็นลำดับงาน จุดเสี่ยง และสิ่งที่ต้องทดสอบ

## 1. เรากำลังรวมอะไร

เรามีระบบ 2 ชุด:

| ชุดระบบ | ความหมาย | ใช้ทำอะไร |
|---|---|---|
| Origin Repo | ระบบเดิมจาก GitHub `Nxnt-PN/IMAX_TEST-merge-` | เป็นฐานหลักที่ต้องรักษาให้ทำงานเหมือนเดิม |
| IMAX_MAIN | ระบบที่รวม Petty Cash แล้ว | เป็นแหล่งโค้ดที่จะค่อย ๆ ย้ายเข้า Origin |

เป้าหมายคือไม่เอา IMAX_MAIN ไปทับ Origin ทั้งก้อน แต่ย้ายทีละส่วน ตรวจทีละรอบ และบันทึกทุกการเปลี่ยนแปลง

## 2. ทำไมต้องแบ่ง PR ย่อย

ถ้ารวมทั้งหมดครั้งเดียว จะหาสาเหตุยากมากเมื่อระบบพัง เพราะอาจมาจาก backend, frontend, database, permission หรือ workflow ก็ได้

การแบ่ง PR ย่อยช่วยให้:

- รู้ว่าแต่ละรอบเพิ่มอะไร
- ทดสอบเฉพาะส่วนได้
- rollback เฉพาะรอบที่มีปัญหาได้
- reviewer อ่าน diff ได้ง่าย
- ระบบเดิม เช่น Leave, User, Role, Workflow และ Settings ยังถูกป้องกัน

## 3. กติกาหลัก

| กติกา | ภาษาคนทั่วไป | ภาษาคน technical |
|---|---|---|
| ไม่ทับทั้งโปรเจค | ไม่ยกของใหม่ไปวางทับของเดิมทั้งก้อน | merge เฉพาะไฟล์หรือเฉพาะ block ที่จำเป็น |
| ไม่เปลี่ยนระบบเดิมโดยไม่จำเป็น | ของเดิมต้องยังใช้ได้เหมือนเดิม | คง route, API contract, permission name, schema และ workflow |
| มีเอกสารทุกครั้ง | ทุก commit ต้องบอกว่าเปลี่ยนอะไร | update `docs/merge-change-log.md` ก่อน commit |
| ทดสอบก่อน commit | ไม่เก็บงานที่ยังไม่ผ่าน test | run `go test ./...` หรือ `npm.cmd run build` ตามงาน |
| แยก backend/frontend | backend ต้องพร้อมก่อนเปิด UI | ลดปัญหา frontend เรียก API ที่ยังไม่มี |

## 4. ลำดับ PR ที่จะรวม

| PR | ชื่อ | คนทั่วไปควรเข้าใจว่า | คน technical ควรรู้ว่า |
|---|---|---|---|
| PR 0 | Setup Safety | เตรียมพื้นที่ให้ปลอดภัยก่อนย้ายโค้ด | เพิ่ม ignore rules และเอกสาร ไม่มี logic change |
| PR 1 | Backend Foundation | เพิ่มฐานข้อมูลพื้นฐาน เช่น Location | เพิ่ม location backend และ user location support |
| PR 2 | Backend Schema + Seed | เพิ่มโครงฐานข้อมูลและข้อมูลตั้งต้น Petty Cash | เพิ่ม migrations, permissions, roles, workflow, systems, seed |
| PR 3 | Backend Core API | เปิด API หลักของ Petty Cash | เพิ่ม `internal/pettycash`, routes, list/detail/create/update/upload/pdf |
| PR 4 | Backend Workflow | เปิดขั้นตอนอนุมัติ Petty Cash | submit/approve/reject/cancel/resend/history และ badge |
| PR 5 | Frontend Foundation | เตรียมเมนู สิทธิ์ ภาษา และ settings | merge route/sidebar/permission/i18n/settings/location |
| PR 6 | Frontend Core | เพิ่มหน้าจอ Petty Cash หลัก | เพิ่ม `src/modules/pettycash` และ route ที่เกี่ยวข้อง |
| PR 7 | Frontend Polish | ทำ workflow/report ให้ครบและตรวจมือถือ | approve/reject/resend/cancel/export/upload/pdf/i18n/mobile |

## 5. วิธีอ่าน change log

เอกสาร `docs/merge-change-log.md` จะบอกทุก PR ว่า:

- เพิ่มหรือแก้อะไร
- เพิ่มหรือแก้ตรงไหน
- ของเดิมเป็นอะไร
- ของใหม่เป็นอะไร
- ทำหน้าที่อะไร
- ทดสอบอะไรแล้ว
- ถ้าต้องย้อนกลับต้องถอยอะไร

ถ้าไม่เขียนโค้ด ให้ดู `Summary`, `Behavior Impact`, `Tests Run`  
ถ้าเขียนโค้ด ให้ดู `Files Changed`, `Rollback Note` และ diff จริงใน branch

## 6. จุดที่ต้องระวัง

| จุดเสี่ยง | ทำไมเสี่ยง | วิธีลดความเสี่ยง |
|---|---|---|
| Database migration | แก้ผิดอาจกระทบข้อมูลจริง | ใช้ Atlas lint/dry-run และไม่แก้ migration ที่ apply แล้ว |
| Permission | ชื่อผิดแล้ว UI/API อาจใช้ไม่ได้ | คง permission name จาก IMAX_MAIN |
| Workflow | Leave เดิมและ Petty Cash มี logic อนุมัติ | ทดสอบ Leave regression ทุกครั้งที่แตะ workflow |
| Sidebar/Menu badge | เป็นจุดรวม task count | ตรวจ menu-status และ websocket |
| ภาษา TH/EN | ผู้ใช้ต้องเปลี่ยนภาษาได้ทันที | ตรวจ i18n หลัง PR frontend |

## 7. Definition of Done

PR พร้อม review เมื่อครบทุกข้อ:

- code change อยู่ใน scope ของ PR
- มี section ใน `docs/merge-change-log.md`
- ไม่มี `.env`, cache, build output หรือ runtime files ใน diff
- test/build ผ่าน
- มี rollback note
- ระบบเดิมที่เกี่ยวข้องยังทำงานเหมือนเดิม

## 8. สรุปสั้นที่สุด

เราจะรวม Petty Cash เข้า Origin แบบต่อทีละชั้น ทุกชั้นต้องมีเอกสารก่อน commit และต้องทดสอบก่อนขยับไปชั้นถัดไป

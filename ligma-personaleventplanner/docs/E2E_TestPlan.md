# E2E Test Plan – [[Ligma Personal Event Planner]]
**Team:** [[ชื่อทีม/กลุ่ม]]  
**Scope:** Authentication (Google Sign-In via Firebase) + First Feature ([[Events CRUD]])  
**Environment:** [[Dev URL เช่น http://localhost:3000]]  
**Browsers:** Chromium (required), WebKit & Firefox (optional)  
**Assumptions:**
- Google OAuth ถูกตั้งค่าแล้ว และมี test account ใช้งานได้
- ใช้ไฟร์เบสของ dev / หรือ emulator ตามที่ทีมเลือก
- มี test data ขั้นต่ำ 1 ชุดสำหรับการสร้าง/ลบอีเวนต์

---

## 1) Test Strategy (ย่อ)
- **Approach:** เขียน E2E ด้วย Playwright (auto-wait, selectors ชัดเจน, data-testid)  
- **Risk/Focus:** 
  - flow login → redirect → session persistence
  - protected routes
  - event creation/deletion (UI + persistence stub/จริง)
- **Out of Scope (Phase 2):** การทดสอบเชิงประสิทธิภาพ, cross-device, visual diff

---

## 2) Test Data
| Data | Value | Note |
|---|---|---|
| Test Google account | [[test.user@example.com]] | สำหรับ Sign-In |
| Event title | "E2E Demo Event" | ตัวอย่างสำหรับสร้าง/ลบ |
| Event time | [[เช่น วันนี้ 19:00–20:00]] | ปรับตาม UI |

> แนะนำให้ใส่ `data-testid` ในปุ่ม/ช่องสำคัญ เช่น `data-testid="btn-google"`, `data-testid="btn-create-event"`

---

## 3) E2E Scenarios (3–5 cases)

### Scenario ID: E2E-001
**Title:** User login and dashboard access  
**Preconditions:** Google OAuth configured; test account available  
**Steps:**
1) Open home page `[[/]]`  
2) Click **Sign in with Google** (`[data-testid="btn-google"]`)  
3) After callback, navigate/redirect to `/dashboard`  
4) Verify user name/email visible (`[data-testid="user-email"]`)  
**Expected:** Dashboard shows authenticated user info

---

### Scenario ID: E2E-002 (Negative)
**Title:** Protected page redirects when unauthenticated  
**Preconditions:** Not logged in  
**Steps:**
1) Visit `/dashboard` directly  
2) Observe redirect to `/login` (or home)  
3) Verify login UI visible (`[data-testid="btn-google"]`)  
**Expected:** Unauthenticated user cannot access protected page and is redirected

---

### Scenario ID: E2E-003
**Title:** Create a new event (happy path)  
**Preconditions:** Logged in; on `/dashboard`  
**Steps:**
1) Click **New Event** (`[data-testid="btn-new-event"]`)  
2) Fill **Title** = "E2E Demo Event" (`[data-testid="input-title"]`)  
3) Pick **Date/Time** = [[กำหนดตาม UI]] (`[data-testid="input-datetime"]`)  
4) Click **Save** (`[data-testid="btn-save-event"]`)  
5) Verify event item appears in list (`[data-testid="event-item"]` contains "E2E Demo Event")  
**Expected:** Event แสดงในรายการ และอยู่หลัง refresh

---

### Scenario ID: E2E-004
**Title:** Delete an existing event  
**Preconditions:** Logged in; มี event "E2E Demo Event" อยู่ใน list  
**Steps:**
1) Locate event item "E2E Demo Event"  
2) Click **Delete** (`[data-testid="btn-delete-event"]`)  
3) Confirm deletion (`[data-testid="confirm-delete"]`)  
4) Verify event item no longer appears  
**Expected:** Event ถูกลบออกจาก UI และไม่กลับมาหลัง refresh

---

### Scenario ID: E2E-005
**Title:** Sign out clears session and blocks protected routes  
**Preconditions:** Logged in  
**Steps:**
1) Click **Sign out** (`[data-testid="btn-signout"]`)  
2) Verify redirect to login page  
3) Attempt to open `/dashboard`  
**Expected:** Redirected back to login (session invalid)

---

## 4) Acceptance Criteria
- แผนต้องครอบคลุม: **Auth + 1 Feature** และมี **Negative case** อย่างน้อย 1  
- ทุก scenario มี: Preconditions, Steps, Expected ครบถ้วน  
- ระบุ selectors/data-testid ที่จะใช้ในโค้ดได้จริง  
- นำไปเขียนเป็น Playwright test ได้ 1–3 ไฟล์ โดย mapping ชัดเจน

---

## 5) Mapping to Playwright (คร่าว ๆ)
| Scenario | Test File | Notes |
|---|---|---|
| E2E-001 | `tests/e2e/auth.spec.ts` | login flow + redirect |
| E2E-002 | `tests/e2e/protected.spec.ts` | negative redirect |
| E2E-003/004 | `tests/e2e/events.spec.ts` | create/delete |
| E2E-005 | `tests/e2e/auth.spec.ts` | signout + block |

> Tips: ใช้ `storageState` เก็บ session หลัง login เพื่อลดขั้นตอนซ้ำ ๆ:
> - มี test หนึ่งที่ทำ login แล้วบันทึกไฟล์ state
> - tests อื่น ๆ ใช้ `use: { storageState: 'state.json' }`

---

## 6) Risks & Mitigations
- **OAuth popup/redirect flakiness:** ใช้ test account เฉพาะ, เปิด `--headed`, จัดการ consent ครั้งเดียวแล้ว reuse session  
- **Firebase write latency:** เพิ่ม `await expect(...).toBeVisible()` และรอ element ที่บ่งชี้ persistence  
- **Selector เปราะบาง:** ใช้ `data-testid` แทนการยึดติดกับข้อความหรือโครงสร้าง DOM

---

## 7) Exit Criteria (Phase 2)
- เอกสารฉบับนี้เสร็จและอยู่ใน repo  
- ทุก scenario ผ่านการ review ภายในทีม  
- ระบุไฟล์ test ที่จะ implement ใน Phase 3 (เริ่มที่ E2E-001 เป็นอย่างน้อย)

"use client";

import { useState, useMemo, useContext, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, Search, Filter, Plus, ChevronLeft, ChevronRight, RefreshCw, LogOut, Settings, Calendar, Pencil, Trash } from "lucide-react"
import TimePicker from "@/components/ui/time-picker"
import { subscribeUserEvents, addUserEvent, updateUserEvent, deleteUserEvent, deleteLegacyUserEvent } from "../../context/eventsStore"
import { subscribeUserTodos, addUserTodo, updateUserTodo, deleteUserTodo } from "../../context/todoStore"
import { UserAuthContext } from "../../context/auth-context"

// No seeded events; everything comes from Firestore per-user
const initialEventsByDay = {}

const todoItems = []

export default function CalendarViewPage() {
  const { user, signOut } = useContext(UserAuthContext)
  const router = useRouter()

  const isE2E = useMemo(() => {
    try {
      return process.env.NEXT_PUBLIC_E2E_TEST === '1' && typeof window !== 'undefined' && window.localStorage?.getItem('e2e_login') === '1'
    } catch {
      return false
    }
  }, [])

  useEffect(() => {
    if (!user && !isE2E) {
      router.push("/")
    }
  }, [user, router, isE2E])

  // E2E helper: auto open add modal via query param `?autoOpenAdd=1`
  useEffect(() => {
    if (!isE2E) return
    try {
      const u = new URL(window.location.href)
      if (u.searchParams.get('autoOpenAdd') === '1') {
        setIsAddOpen(true)
      }
    } catch { /* ignore */ }
  }, [isE2E])

  const todayInit = new Date()
  const [selectedDay, setSelectedDay] = useState(todayInit.getDate())
  const [selectedMonth, setSelectedMonth] = useState(todayInit.getMonth())
  const [selectedYear, setSelectedYear] = useState(todayInit.getFullYear())
  const [todos, setTodos] = useState(todoItems)
  const [isTodoModalOpen, setIsTodoModalOpen] = useState(false)
  const [editingTodo, setEditingTodo] = useState(null)
  const [todoLabel, setTodoLabel] = useState("")
  const [todoNote, setTodoNote] = useState("")
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSynced, setLastSynced] = useState(null)
  const [syncError, setSyncError] = useState(null)
  const [currentMonth, setCurrentMonth] = useState(todayInit.getMonth()) // 0-indexed
  const [currentYear, setCurrentYear] = useState(todayInit.getFullYear())
  const [eventsData, setEventsData] = useState(initialEventsByDay)
  const [allEvents, setAllEvents] = useState([])
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [toast, setToast] = useState(null) // { message, variant }
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    if (typeof window !== "undefined") {
      const v = parseInt(window.localStorage?.getItem("sidebarWidth") || "", 10)
      if (!isNaN(v) && v >= 220 && v <= 480) return v
    }
    return 256
  })
  const [isResizing, setIsResizing] = useState(false)
  const [isSmallScreen, setIsSmallScreen] = useState(false)
  const [newEventName, setNewEventName] = useState("")
  const [newEventType, setNewEventType] = useState("")
  const [startDate, setStartDate] = useState("") // ISO YYYY-MM-DD
  const [endDate, setEndDate] = useState("") // ISO YYYY-MM-DD
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [eventColor, setEventColor] = useState("#ffffff")
  const [frequency, setFrequency] = useState({ Daily: false, Weekly: false, Monthly: false })
  const startDateRef = useRef(null)
  const endDateRef = useRef(null)
  // custom time picker, not using native time inputs
  const [showStartPicker, setShowStartPicker] = useState(false)
  const [showEndPicker, setShowEndPicker] = useState(false)
  const [startPickerMonth, setStartPickerMonth] = useState(currentMonth)
  const [startPickerYear, setStartPickerYear] = useState(currentYear)
  const [endPickerMonth, setEndPickerMonth] = useState(currentMonth)
  const [endPickerYear, setEndPickerYear] = useState(currentYear)
  // Removed reordering by arrows per user request

  const openNativePicker = (ref) => {
    const el = ref?.current
    if (!el) return
    try {
      if (typeof el.showPicker === "function") {
        el.showPicker()
        return
      }
    } catch (_) {
      // Fallback below
    }
    el.focus()
    el.click?.()
  }

  const openAddTodoModal = () => {
    setEditingTodo(null)
    setTodoLabel("")
    setTodoNote("")
    setIsTodoModalOpen(true)
  }

  const openEditTodo = (todo) => {
    setEditingTodo(todo)
    setTodoLabel(todo.label || "")
    setTodoNote(todo.note || "")
    setIsTodoModalOpen(true)
  }

  const closeTodoModal = () => {
    setIsTodoModalOpen(false)
    setEditingTodo(null)
  }

  const toggleTodo = async (todo, nextCheckedVal) => {
    const nextChecked = typeof nextCheckedVal === "boolean" ? nextCheckedVal : !todo.checked
    setTodos((prev) => prev.map((t) => (t.id === todo.id ? { ...t, checked: nextChecked } : t)))
    try { if (user?.uid) await updateUserTodo(user.uid, todo.id, { checked: nextChecked }) } catch (_) { /* ignore */ }
  }

  const handleSaveTodo = async (e) => {
    e?.preventDefault?.()
    const label = todoLabel.trim()
    if (!label) return
    if (editingTodo) {
      const updated = { ...editingTodo, label, note: todoNote }
      setTodos((prev) => prev.map((t) => (t.id === editingTodo.id ? updated : t)))
      try { if (user?.uid) await updateUserTodo(user.uid, editingTodo.id, { label, note: todoNote }) } catch (_) { /* ignore */ }
    } else {
      const tempId = `tmp-${Date.now()}`
      const newItem = { id: tempId, label, note: todoNote, checked: false }
      setTodos((prev) => [...prev, newItem])
      try {
        if (user?.uid) {
          const realId = await addUserTodo(user.uid, label, todoNote)
          setTodos((prev) => prev.map((t) => (t.id === tempId ? { ...t, id: realId } : t)))
        }
      } catch (_) { /* ignore */ }
    }
    setIsTodoModalOpen(false)
    setEditingTodo(null)
  }

  const handleDeleteTodo = async (todo) => {
    setTodos((prev) => prev.filter((t) => t.id !== todo.id))
    try { if (user?.uid) await deleteUserTodo(user.uid, todo.id) } catch (_) { /* ignore */ }
    if (editingTodo && editingTodo.id === todo.id) {
      setIsTodoModalOpen(false)
      setEditingTodo(null)
    }
  }

  // Avatar: try Google photo via proxy; fall back to first letter
  const avatarUrl = useMemo(() => {
    const raw = user?.photoURL || user?.providerData?.[0]?.photoURL || ""
    if (!raw) return ""
    try {
      const u = new URL(raw)
      if (u.hostname.endsWith("googleusercontent.com") && !u.searchParams.has("sz")) {
        u.searchParams.set("sz", "96")
      }
      return `/api/avatar?u=${encodeURIComponent(u.toString())}`
    } catch {
      return ""
    }
  }, [user])
  const avatarLetter = useMemo(() => {
    const fromDisplay = (user?.displayName || "").trim()
    const fromEmail = (user?.email || "").trim()
    const ch = fromEmail?.[0] || fromDisplay?.[0] || "U"
    return ch.toUpperCase()
  }, [user])

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  const goToToday = () => {
    const today = new Date()
    setCurrentMonth(today.getMonth())
    setCurrentYear(today.getFullYear())
  }

  const handleManualSync = async () => {
    if (isSyncing) return
    setIsSyncing(true)
    setSyncError(null)
    try {
      await new Promise((r) => setTimeout(r, 1500))
      setLastSynced(new Date())
    } catch (e) {
      setSyncError(e?.message || "Sync failed")
    } finally {
      setIsSyncing(false)
    }
  }

  const handleLogout = async () => {
    await signOut()
  }

  const handleSettings = () => {
    console.log("Settings clicked")
    // Add settings navigation here
  }

  const { miniCalendarDays, calendarGrid } = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1)
    const lastDay = new Date(currentYear, currentMonth + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startDayOfWeek = (firstDay.getDay() + 6) % 7 // Mon=0

    // Mini calendar (left) stays as before with nulls
    const mini = []
    let d = 1
    let miniWeek = []
    for (let i = 0; i < startDayOfWeek; i++) miniWeek.push(null)
    while (d <= daysInMonth) {
      miniWeek.push(d)
      if (miniWeek.length === 7) {
        mini.push([...miniWeek])
        miniWeek = []
      }
      d++
    }
    if (miniWeek.length > 0) {
      while (miniWeek.length < 7) miniWeek.push(null)
      mini.push([...miniWeek])
    }

    // Full grid (main) shows leading/trailing days from adjacent months
    const startOfGrid = new Date(firstDay)
    const lead = startDayOfWeek // how many from previous month
    startOfGrid.setDate(firstDay.getDate() - lead)
    const cells = []
    const rows = 5
    const cellCount = rows * 7 // 5 weeks
    for (let i = 0; i < cellCount; i++) {
      const dt = new Date(startOfGrid)
      dt.setDate(startOfGrid.getDate() + i)
      cells.push({
        day: dt.getDate(),
        month: dt.getMonth(),
        year: dt.getFullYear(),
        isCurrentMonth: dt.getMonth() === currentMonth && dt.getFullYear() === currentYear,
      })
    }
    const full = []
    for (let r = 0; r < rows; r++) full.push(cells.slice(r * 7, r * 7 + 7))

    return { miniCalendarDays: mini, calendarGrid: full }
  }, [currentMonth, currentYear])

  // Parse event start time (HH:MM or "HH:MM-HH:MM") into minutes since 00:00
  const parseStartMinutes = (ev) => {
    const src = ev?.startTime || ev?.time || ""
    if (!src) return 24 * 60 + 1
    const first = String(src).split("-")[0].trim()
    const [h, m] = first.split(":")
    const hh = parseInt(h, 10)
    const mm = parseInt(m || "0", 10)
    if (isNaN(hh) || isNaN(mm)) return 24 * 60 + 1
    return hh * 60 + mm
  }

  const selectedDayEvents = useMemo(() => {
    const monthKey = `${currentMonth + 1}-${currentYear}`
    const monthEvents = eventsData[monthKey] || {}
    const list = monthEvents[selectedDay] || []
    return [...list].sort((a,b)=> parseStartMinutes(a) - parseStartMinutes(b) || (a.name || "").localeCompare(b.name || ""))
  }, [selectedDay, currentMonth, currentYear, eventsData])

  const isToday = (day) => {
    if (!day) return false
    const today = new Date()
    return day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()
  }

  const getEventBadgeColor = (type) => {
    switch (type) {
      case "Daily":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
      case "Work":
        return "bg-[#4285f4]/20 text-[#4285f4] border-[#4285f4]/30"
      case "Party":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getEventDotColor = (type) => {
    switch (type) {
      case "Daily":
        return "bg-emerald-500"
      case "Work":
        return "bg-[#4285f4]"
      case "Party":
        return "bg-amber-500"
      default:
        return "bg-gray-500"
    }
  }


  // Ensure any legacy time strings with AM/PM display as 24H (HH:MM[-HH:MM])
  const to24 = (h, m, ap) => {
    let hour = parseInt(h, 10)
    const min = m || "00"
    const ampm = (ap || "").toLowerCase()
    if (ampm === "pm" && hour < 12) hour += 12
    if (ampm === "am" && hour === 12) hour = 0
    return `${String(hour).padStart(2, "0")}:${min.padStart(2, "0")}`
  }
  const formatTime24 = (str) => {
    if (!str) return ""
    const s = String(str).trim()
    // Pattern like "h:mm AM - h:mm PM" or "h:mmAM-h:mmPM"
    const range = s.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*[-–]\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i)
    if (range) {
      const start = to24(range[1], range[2], range[3])
      const end = to24(range[4], range[5], range[6])
      return `${start}-${end}`
    }
    // Single time like "h:mm PM"
    const single = s.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i)
    if (single) return to24(single[1], single[2], single[3])
    return s // already 24H
  }

  const typeColorHex = (type) => {
    switch (type) {
      case "Daily":
        return "#10b981"
      case "Work":
        return "#4285f4"
      case "Party":
        return "#f59e0b"
      default:
        return "#ffffff"
    }
  }

  // Sidebar resize handlers
  useEffect(() => {
    const onMove = (e) => {
      if (!isResizing) return
      const min = 220
      const max = 480
      const next = Math.max(min, Math.min(max, e.clientX))
      setSidebarWidth(next)
    }
    const onUp = () => {
      if (isResizing) setIsResizing(false)
      try { window.localStorage?.setItem("sidebarWidth", String(sidebarWidth)) } catch (_) { /* ignore */ }
    }
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", onUp)
    return () => {
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseup", onUp)
    }
  }, [isResizing, sidebarWidth])

  // Track small screen to switch layout to stacked column
  useEffect(() => {
    const check = () => {
      try {
        setIsSmallScreen(typeof window !== 'undefined' && window.innerWidth < 768)
      } catch (_) {
        setIsSmallScreen(false)
      }
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Auto hide toast
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2500)
    return () => clearTimeout(t)
  }, [toast])

  // Build calendar map from a flat list of events
  const buildEventsMap = (items) => {
    const map = {}
    items.forEach((ev) => {
      // parse dd/MM/YYYY
      let dt = null
      const m = /^\s*(\d{1,2})\/(\d{1,2})\/(\d{4})\s*$/.exec(ev.startDate || "")
      if (m) {
        dt = new Date(parseInt(m[3],10), parseInt(m[2],10)-1, parseInt(m[1],10))
      } else if (ev.startDate) {
        const tryDt = new Date(ev.startDate)
        if (!isNaN(tryDt.getTime())) dt = tryDt
      }
      if (!dt) return
      const monthKey = `${dt.getMonth()+1}-${dt.getFullYear()}`
      const day = dt.getDate()
      if (!map[monthKey]) map[monthKey] = {}
      if (!map[monthKey][day]) map[monthKey][day] = []
      map[monthKey][day].push({
        id: ev.id,
        name: ev.name,
        time: ev.time,
        type: ev.type,
        eventColor: ev.eventColor,
        startDate: ev.startDate,
        endDate: ev.endDate,
        startTime: ev.startTime,
        endTime: ev.endTime,
        frequency: ev.frequency || [],
      })
    })
    return map
  }

  // Subscribe to Firestore events for the current user
  useEffect(() => {
    if (!user?.uid) return
    const unsub = subscribeUserEvents(
      user.uid,
      (items) => {
        setAllEvents(items)
        setEventsData(buildEventsMap(items))
      },
      (err) => {
        const msg = err?.code === 'permission-denied'
          ? 'ไม่มีสิทธิ์อ่านข้อมูลอีเวนต์ โปรดตรวจสอบ Firestore Rules'
          : (err?.message || 'เกิดข้อผิดพลาดในการอ่านข้อมูลอีเวนต์')
        setToast({ message: msg, variant: 'danger' })
      }
    )
    return () => unsub && unsub()
  }, [user?.uid])

  // Subscribe to user's to-dos
  useEffect(() => {
    if (!user?.uid) return
    const unsub = subscribeUserTodos(
      user.uid,
      (items) => setTodos(items),
      (err) => {
        const msg = err?.code === 'permission-denied'
          ? 'ไม่มีสิทธิ์อ่านรายการงาน โปรดตรวจสอบ Firestore Rules'
          : (err?.message || 'เกิดข้อผิดพลาดในการอ่านรายการงาน')
        setToast({ message: msg, variant: 'danger' })
      }
    )
    return () => unsub && unsub()
  }, [user?.uid])

  const openAddModal = () => {
    const pad = (n) => String(n).padStart(2, "0")
    const now = new Date()
    const y = now.getFullYear()
    const m = now.getMonth() + 1
    const d = now.getDate()
    const todayStr = `${y}-${pad(m)}-${pad(d)}`
    setNewEventName("")
    setNewEventType("")
    setStartDate(todayStr)
    setEndDate(todayStr)
    setStartTime("08:00")
    setEndTime("10:00")
    setEventColor("#ffffff")
    setFrequency({ Daily: false, Weekly: false, Monthly: false })
    setIsAddOpen(true)
    setStartPickerMonth(currentMonth)
    setStartPickerYear(currentYear)
    setEndPickerMonth(currentMonth)
    setEndPickerYear(currentYear)
  }

  const closeAddModal = () => setIsAddOpen(false)
  const closeEditModal = () => { setIsEditOpen(false); setEditingEvent(null) }

  const handleAddEvent = (e) => {
    e?.preventDefault?.()
    if (!newEventName) return
    const targetDate = startDate ? new Date(startDate) : new Date(currentYear, currentMonth, selectedDay)
    const tYear = targetDate.getFullYear()
    const tMonth = targetDate.getMonth() + 1
    const tDay = targetDate.getDate()
    const monthKey = `${tMonth}-${tYear}`
    const id = `${monthKey}-${tDay}-${Date.now()}`
    const displayTime = startTime && endTime && startTime !== endTime ? `${startTime}-${endTime}` : startTime || ""
    const payload = {
      name: newEventName,
      time: displayTime,
      type: newEventType?.trim() || "Other",
      startDate,
      endDate,
      startTime,
      endTime,
      eventColor,
      priority: (selectedDayEvents?.length ?? 0),
      frequency: Object.entries(frequency).filter(([_, v]) => v).map(([k]) => k),
    }
    try { if (user?.uid) addUserEvent(user.uid, payload) } catch (_) { /* ignore */ }
    // In E2E mode, also update local state so tests don't rely on Firestore latency
    try {
      if (isE2E) {
        const dt = startDate ? new Date(startDate) : new Date(currentYear, currentMonth, selectedDay)
        const monthKey2 = `${dt.getMonth()+1}-${dt.getFullYear()}`
        const day2 = dt.getDate()
        const ev = {
          id,
          name: payload.name,
          time: payload.time,
          type: payload.type,
          eventColor: payload.eventColor,
          startDate: payload.startDate,
          endDate: payload.endDate,
          startTime: payload.startTime,
          endTime: payload.endTime,
          frequency: payload.frequency,
        }
        setEventsData(prev => {
          const next = { ...prev }
          if (!next[monthKey2]) next[monthKey2] = {}
          const arr = (next[monthKey2][day2] || []).slice()
          arr.push(ev)
          next[monthKey2][day2] = arr
          return next
        })
      }
    } catch {}
    setIsAddOpen(false)
    setToast({ message: "Event added", variant: "success" })
  }

  const openEdit = (event) => {
    setEditingEvent(event)
    setNewEventName(event.name || "")
    setNewEventType(event.type || "")
    setStartDate(event.startDate || "")
    setEndDate(event.endDate || event.startDate || "")
    setStartTime(event.startTime || "")
    setEndTime(event.endTime || "")
    setEventColor(event.eventColor || "#ffffff")
    setFrequency({ Daily: event.frequency?.includes("Daily") || false, Weekly: event.frequency?.includes("Weekly") || false, Monthly: event.frequency?.includes("Monthly") || false })
    setIsEditOpen(true)
  }

  const handleEditEvent = async (e) => {
    e?.preventDefault?.()
    if (!editingEvent || !user?.uid) {
      setIsEditOpen(false)
      setToast({ message: "ไม่สามารถแก้ไขได้ (ยังไม่เข้าสู่ระบบ?)", variant: "error" })
      return
    }
    const data = {
      name: newEventName,
      type: newEventType || "Other",
      startDate,
      endDate,
      startTime,
      endTime,
      time: startTime && endTime && startTime !== endTime ? `${startTime}-${endTime}` : startTime || "",
      eventColor,
      frequency: Object.entries(frequency).filter(([_, v]) => v).map(([k]) => k),
    }
    const id = editingEvent.id
    // Close optimistically so the modal always disappears immediately
    setIsEditOpen(false)
    setEditingEvent(null)
    setToast({ message: "แก้ไข Event เรียบร้อยแล้ว", variant: "success" })
    try {
      if (editingEvent?.origin === 'legacy') {
        await addUserEvent(user.uid, data)
        try { await deleteLegacyUserEvent(user.uid, id) } catch (_) { /* ignore */ }
      } else {
        await updateUserEvent(user.uid, id, data)
      }
    } catch (err) {
      // Show error but keep modal closed
      setToast({ message: "แก้ไขไม่สำเร็จ โปรดลองอีกครั้ง", variant: "error" })
    }
  }

  const handleDeleteEvent = async (event) => {
    if (!user?.uid || !event?.id) return
    // Close optimistically and show toast immediately
    setIsEditOpen(false)
    setEditingEvent(null)
    setToast({ message: "ลบ Event เรียบร้อยแล้ว", variant: "danger" })
    try {
      if (event.origin === 'legacy') {
        await deleteLegacyUserEvent(user.uid, event.id)
      } else {
        await deleteUserEvent(user.uid, event.id)
      }
    } catch (_) {
      // If deletion fails, surface an error toast (modal stays closed)
      setToast({ message: "ลบไม่สำเร็จ โปรดลองอีกครั้ง", variant: "error" })
    }
  }

  if (!user && !isE2E)
    return (
      <div className="flex h-screen items-center justify-center bg-[#1a1a1a] text-white">Redirecting to login...</div>
    )

  return (
    <>
    <div className="flex flex-col md:flex-row h-screen bg-[#1a1a1a] text-white overflow-hidden">
      {toast && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-4 py-2 rounded-md border ${
            toast.variant === 'success'
              ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
              : toast.variant === 'danger' || toast.variant === 'error'
              ? 'bg-red-600/20 border-red-500 text-red-300'
              : 'bg-[#333]/80 border-gray-700 text-gray-200'
          }`}
          role="status"
          aria-live="polite"
        >
          {toast.message}
        </div>
      )}
      {/* To-do Modal */}
      {isTodoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={closeTodoModal} />
          <div className="relative z-10 w-full max-w-md rounded-xl border border-gray-800 bg-[#0f0f0f] p-6 shadow-xl">
            <h3 className="text-2xl font-semibold mb-4 text-center">{editingTodo ? "Edit task" : "Add task"}</h3>
            <form onSubmit={handleSaveTodo} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Task</label>
                <input
                  className="w-full rounded-md bg-[#1a1a1a] border border-gray-800 px-3 py-2 text-sm outline-none focus:border-gray-600"
                  placeholder="What do you need to do?"
                  value={todoLabel}
                  onChange={(e) => setTodoLabel(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Details (optional)</label>
                <textarea
                  className="w-full rounded-md bg-[#1a1a1a] border border-gray-800 px-3 py-2 text-sm outline-none focus:border-gray-600 resize-none"
                  rows={3}
                  placeholder="Add more context"
                  value={todoNote}
                  onChange={(e) => setTodoNote(e.target.value)}
                />
              </div>
              <div className="flex items-center justify-between gap-2 pt-2">
                {editingTodo ? (
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-red-500 hover:text-red-400 hover:bg-transparent"
                    onClick={() => handleDeleteTodo(editingTodo)}
                  >
                    Delete
                  </Button>
                ) : <div />}
                <div className="flex items-center gap-2">
                  <Button type="button" variant="ghost" onClick={closeTodoModal}>Cancel</Button>
                  <Button type="submit" disabled={!todoLabel.trim()}>{editingTodo ? "Save" : "Add"}</Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Left Sidebar */}
  <div className="relative bg-[#0f0f0f] border-r border-gray-800 flex flex-col overflow-hidden md:flex-shrink-0" style={isSmallScreen ? { width: '100%' } : { width: sidebarWidth }}>
        {/* Mini Calendar */}
        <div className="p-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold mb-4">{monthNames[currentMonth]}</h2>
          <div className="space-y-1">
            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-1 text-xs text-gray-500 mb-2">
              {["m", "t", "w", "t", "f", "s", "s"].map((day, i) => (
                <div key={i} className="text-center">
                  {day}
                </div>
              ))}
            </div>
            {/* Calendar days */}
            {miniCalendarDays.map((week, weekIdx) => (
              <div key={weekIdx} className="grid grid-cols-7 gap-1">
                {week.map((day, dayIdx) => {
                  const monthKey = `${currentMonth + 1}-${currentYear}`
                  const monthEvents = eventsData[monthKey] || {}
                  const events = day ? monthEvents[day] || [] : []
                  const dotColors = Array.from(
                    new Set(
                      events.map((e) => e.eventColor || typeColorHex(e.type))
                    )
                  ).slice(0, 3)

                  return (
                    <button
                      key={dayIdx}
                      onClick={() => {
                        if (!day) return
                        setSelectedDay(day)
                        setSelectedMonth(currentMonth)
                        setSelectedYear(currentYear)
                      }}
                      className={`
                        relative aspect-square text-xs rounded flex items-center justify-center flex-col pb-3
                        ${!day ? "invisible" : ""}
                        ${
                          day === selectedDay && selectedMonth === currentMonth && selectedYear === currentYear
                            ? "bg-[#4285f4] text-white"
                            : isToday(day)
                              ? "bg-[#4285f4]/20 text-[#4285f4]"
                              : "text-gray-400 hover:bg-[#4285f4]/10"
                        }
                      `}
                    >
                      <span>{day}</span>
                      {dotColors.length > 0 && (
                        <div className="pointer-events-none absolute inset-x-0 bottom-[1px] flex justify-center gap-[4px]">
                          {dotColors.slice(0, 3).map((c, i) => (
                            <span key={i} className="w-2 h-2 rounded-full" style={{ backgroundColor: c }} />
                          ))}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Today Section */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {isToday(selectedDay) ? "Today" : `${monthNames[currentMonth]} ${selectedDay}`}
              </h2>
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={openAddModal} data-testid="add-event-mini-btn">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {selectedDayEvents.length === 0 ? (
              <div className="text-sm text-gray-500 text-center py-4">No events</div>
            ) : (
              <div className="space-y-2">
                {selectedDayEvents.map((event) => (
                  <div
                    key={event.id}
                    className="group relative p-2 rounded bg-[#1a1a1a] border-l-2"
                    style={{ borderLeftColor: event.eventColor || (event.type === "Daily" ? "#10b981" : event.type === "Work" ? "#3b82f6" : event.type === "Party" ? "#f59e0b" : "#ffffff") }}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: event.eventColor || typeColorHex(event.type) }} />
                      <span className="text-xs text-gray-400">{formatTime24(event.time) || ""}</span>
                      <div className="flex-1" />
                      <Button size="sm" variant="ghost" onClick={() => openEdit(event)} className="h-7 px-2 flex-shrink-0 text-white hover:text-white hover:bg-white/10">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <div className="mt-1 text-sm font-semibold truncate">{event.name}</div>
                    {/* Hover details tooltip: show only Type */}
                    <div className="pointer-events-none absolute left-2 top-full mt-2 hidden w-48 rounded-md border border-gray-800 bg-[#0f0f0f] p-3 shadow-lg group-hover:block">
                      {event.type && (
                        <div className="text-xs text-gray-300"><span className="text-gray-400">Type:</span> {event.type}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* To-do List */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">To-do list</h2>
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={openAddTodoModal}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {todos.length === 0 ? (
              <div className="text-sm text-gray-500 text-center py-4">No tasks</div>
            ) : (
              <div className="space-y-3">
                {todos.map((todo) => (
                  <div key={todo.id} className="flex items-center gap-2">
                    <Checkbox
                      id={todo.id}
                      checked={todo.checked}
                      onChange={(e) => toggleTodo(todo, e.target.checked)}
                      className="border-gray-600"
                    />
                    <label
                      htmlFor={todo.id}
                      className={`text-sm cursor-pointer ${todo.checked ? "line-through text-gray-500" : ""}`}
                    >
                      {todo.label}
                    </label>
                    <div className="flex-1" />
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-white hover:text-white hover:bg-white/10" type="button" onClick={() => openEditTodo(todo)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Calendar Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="h-16 border-b border-gray-800 flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            <Button size="icon" variant="ghost">
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Button size="icon" variant="ghost" onClick={goToPreviousMonth}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-semibold">
                {monthNames[currentMonth]} {currentYear}
              </h1>
              <Button size="icon" variant="ghost" onClick={goToNextMonth}>
                <ChevronRight className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2 pl-2">
                <Button size="icon" variant="ghost" onClick={handleManualSync} className="relative">
                  {isSyncing && <span className="absolute inset-0 animate-spin text-white/60 flex items-center justify-center"><RefreshCw className="h-4 w-4" /></span>}
                  {!isSyncing && <RefreshCw className="h-5 w-5" />}
                </Button>
                <span className="text-xs text-gray-400 min-w-[110px]">
                  {isSyncing ? "Syncing..." : lastSynced ? `Synced ${lastSynced.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "Not synced yet"}
                </span>
                {syncError && <span className="text-xs text-red-400">{syncError}</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button size="icon" variant="ghost">
              <Search className="h-5 w-5" />
            </Button>
            <Button size="icon" variant="ghost">
              <Filter className="h-5 w-5" />
            </Button>
            <Button className="gap-2" onClick={openAddModal} data-testid="add-event-btn">
              Add event
              <Plus className="h-4 w-4" />
            </Button>
            {/* Dropdown menu to profile avatar */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 rounded-full p-0">
                  <Avatar className="h-8 w-8">
                    {avatarUrl ? <AvatarImage src={avatarUrl} alt={user?.displayName || user?.email} /> : null}
                    <AvatarFallback fallbackText={avatarLetter}>
                      {avatarLetter}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-[#1a1a1a] border-gray-800">
                <DropdownMenuItem onClick={handleSettings} className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-800" />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-400">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

  {/* Calendar Grid */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full flex flex-col">
            <div className="grid grid-cols-7 border-b border-gray-800 bg-[#0f0f0f] z-10">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <div
                  key={day}
                  className="p-4 text-sm font-medium text-gray-400 text-center border-r border-gray-800 last:border-r-0"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="flex-1 flex flex-col">
              {calendarGrid.map((week, weekIdx) => (
                <div key={weekIdx} className="grid grid-cols-7 border-b border-gray-800 last:border-b-0 flex-1">
                  {week.map((cell, dayIdx) => {
                    const { day, month, year, isCurrentMonth } = cell
                    const monthKey = `${month + 1}-${year}`
                    const monthEvents = eventsData[monthKey] || {}
                    const events = (monthEvents[day] || []).slice().sort((a,b)=> parseStartMinutes(a) - parseStartMinutes(b) || (a.name||'').localeCompare(b.name||''))
                    const hasDaily = events.some((e) => e.type === "Daily")
                    const hasWork = events.some((e) => e.type === "Work")
                    const hasParty = events.some((e) => e.type === "Party")
                    const visibleEvents = events.slice(0, 2)
                    const moreCount = events.length - 2

                    return (
                      <div
                        key={dayIdx}
                        className={`
                          p-2 border-r border-gray-800 last:border-r-0 flex flex-col
                          ${isCurrentMonth ? "bg-[#1a1a1a]" : "bg-[#111114]"}
                          ${day === selectedDay && month === selectedMonth && year === selectedYear ? "bg-[#1f2937]" : ""}
                        `}
                        onClick={() => {
                          setSelectedDay(day)
                          setSelectedMonth(month)
                          setSelectedYear(year)
                          if (month !== currentMonth || year !== currentYear) {
                            setCurrentMonth(month)
                            setCurrentYear(year)
                          }
                        }}
                      >
                        {
                          <>
                            {/* Day number and badges */}
                            <div className="flex items-start justify-between mb-2">
                              <span className={`text-sm font-medium ${isCurrentMonth && isToday(day) ? "text-[#4285f4]" : isCurrentMonth ? "" : "text-gray-500"}`}>
                                {day < 10 ? `0${day}` : day}
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {hasDaily && (
                                  <div className="flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    <span className="text-[10px] text-emerald-400">Daily</span>
                                  </div>
                                )}
                                {hasWork && (
                                  <div className="flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                    <span className="text-[10px] text-[#4285f4]">Work</span>
                                  </div>
                                )}
                                {hasParty && (
                                  <div className="flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                    <span className="text-[10px] text-amber-400">Party</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Events */}
                            <div className="space-y-1 flex-1">
                              {visibleEvents.map((event) => (
                                <div key={event.id} className="flex items-center gap-1.5 text-xs">
                                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: event.eventColor || typeColorHex(event.type) }} />
                                  <span className="text-gray-400 truncate flex-1">{event.name}</span>
                                  <span className="text-gray-500 text-[10px] flex-shrink-0">{formatTime24(event.time)}</span>
                                </div>
                              ))}
                              {moreCount > 0 && (
                                <button className="text-xs text-[#4285f4] hover:text-[#357ABD]">+{moreCount} More</button>
                              )}
                            </div>
                          </>
                        }
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Resize handle (hidden on small screens) */}
        {!isSmallScreen && (
          <div
            className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize hover:bg-[#4285f4]/40"
            onMouseDown={() => setIsResizing(true)}
          />
        )}
      </div>
    </div>
      {/* Add Event Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={closeAddModal} />
          <div className="relative z-10 w-full max-w-md rounded-xl border border-gray-800 bg-[#0f0f0f] p-6 shadow-xl">
            <h3 className="text-2xl font-semibold mb-4 text-center">Add event</h3>
            <form onSubmit={handleAddEvent} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Event Name</label>
                <input
                  className="w-full rounded-md bg-[#1a1a1a] border border-gray-800 px-3 py-2 text-sm outline-none focus:border-gray-600"
                  placeholder="Event name"
                  value={newEventName}
                  onChange={(e) => setNewEventName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">Type of Event</label>
                <input
                  className="w-full rounded-md bg-[#1a1a1a] border border-gray-800 px-3 py-2 text-sm outline-none focus:border-gray-600"
                  placeholder="Type of Event"
                  value={newEventType}
                  onChange={(e) => setNewEventType(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="relative">
                  <label className="block text-sm text-gray-300 mb-1">Start Date</label>
                  <input
                    type="text"
                    className="w-full rounded-md bg-[#1a1a1a] border border-gray-800 px-3 py-2 pr-10 text-sm outline-none focus:border-gray-600"
                    placeholder="DD/MM/YYYY"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    ref={startDateRef}
                    onFocus={() => setShowStartPicker(true)}
                  />
                  <Calendar
                    className="absolute right-3 top-9 h-4 w-4 text-white cursor-pointer"
                    onMouseDown={() => setShowStartPicker((v) => !v)}
                    onClick={() => setShowStartPicker((v) => !v)}
                  />
                  {showStartPicker && (
                    <div className="absolute z-50 mt-2 right-0 w-72 rounded-md border border-gray-800 bg-[#0f0f0f] p-3 shadow-lg">
                      <div className="flex items-center justify-between mb-2">
                        <button type="button" className="p-1 hover:bg-white/10 rounded" onClick={() => {
                          if (startPickerMonth === 0) { setStartPickerMonth(11); setStartPickerYear(startPickerYear - 1) } else { setStartPickerMonth(startPickerMonth - 1) }
                        }}>
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <div className="text-sm font-medium">{monthNames[startPickerMonth]} {startPickerYear}</div>
                        <button type="button" className="p-1 hover:bg-white/10 rounded" onClick={() => {
                          if (startPickerMonth === 11) { setStartPickerMonth(0); setStartPickerYear(startPickerYear + 1) } else { setStartPickerMonth(startPickerMonth + 1) }
                        }}>
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-7 text-[10px] text-gray-400 mb-1">
                        {["Mo","Tu","We","Th","Fr","Sa","Su"].map((d) => <div key={d} className="text-center py-1">{d}</div>)}
                      </div>
                      <div className="grid grid-cols-7 gap-1">
                        {(() => {
                          const first = new Date(startPickerYear, startPickerMonth, 1)
                          const last = new Date(startPickerYear, startPickerMonth + 1, 0)
                          const days = last.getDate()
                          const head = (first.getDay() + 6) % 7
                          const cells = []
                          for (let i=0;i<head;i++) cells.push(null)
                          for (let d=1; d<=days; d++) cells.push(d)
                          while (cells.length % 7 !== 0) cells.push(null)
                          return cells.map((d, i) => (
                            <button
                              key={i}
                              type="button"
                              disabled={!d}
                              className={`h-8 w-8 text-sm rounded flex items-center justify-center ${d?"hover:bg-white/10":"opacity-0"}`}
                              onClick={() => {
                                if (!d) return
                                const pad = (n) => String(n).padStart(2, "0")
                                setStartDate(`${pad(d)}/${pad(startPickerMonth+1)}/${startPickerYear}`)
                                setShowStartPicker(false)
                              }}
                            >
                              {d||""}
                            </button>
                          ))
                        })()}
                      </div>
                    </div>
                  )}
                </div>
                <div className="relative">
                  <label className="block text-sm text-gray-300 mb-1">End Date</label>
                  <input
                    type="text"
                    className="w-full rounded-md bg-[#1a1a1a] border border-gray-800 px-3 py-2 pr-10 text-sm outline-none focus:border-gray-600"
                    placeholder="DD/MM/YYYY"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    ref={endDateRef}
                    onFocus={() => setShowEndPicker(true)}
                  />
                  <Calendar
                    className="absolute right-3 top-9 h-4 w-4 text-white cursor-pointer"
                    onMouseDown={() => setShowEndPicker((v) => !v)}
                    onClick={() => setShowEndPicker((v) => !v)}
                  />
                  {showEndPicker && (
                    <div className="absolute z-50 mt-2 right-0 w-72 rounded-md border border-gray-800 bg-[#0f0f0f] p-3 shadow-lg">
                      <div className="flex items-center justify-between mb-2">
                        <button type="button" className="p-1 hover:bg-white/10 rounded" onClick={() => {
                          if (endPickerMonth === 0) { setEndPickerMonth(11); setEndPickerYear(endPickerYear - 1) } else { setEndPickerMonth(endPickerMonth - 1) }
                        }}>
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <div className="text-sm font-medium">{monthNames[endPickerMonth]} {endPickerYear}</div>
                        <button type="button" className="p-1 hover:bg-white/10 rounded" onClick={() => {
                          if (endPickerMonth === 11) { setEndPickerMonth(0); setEndPickerYear(endPickerYear + 1) } else { setEndPickerMonth(endPickerMonth + 1) }
                        }}>
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-7 text-[10px] text-gray-400 mb-1">
                        {["Mo","Tu","We","Th","Fr","Sa","Su"].map((d) => <div key={d} className="text-center py-1">{d}</div>)}
                      </div>
                      <div className="grid grid-cols-7 gap-1">
                        {(() => {
                          const first = new Date(endPickerYear, endPickerMonth, 1)
                          const last = new Date(endPickerYear, endPickerMonth + 1, 0)
                          const days = last.getDate()
                          const head = (first.getDay() + 6) % 7
                          const cells = []
                          for (let i=0;i<head;i++) cells.push(null)
                          for (let d=1; d<=days; d++) cells.push(d)
                          while (cells.length % 7 !== 0) cells.push(null)
                          return cells.map((d, i) => (
                            <button
                              key={i}
                              type="button"
                              disabled={!d}
                              className={`h-8 w-8 text-sm rounded flex items-center justify-center ${d?"hover:bg-white/10":"opacity-0"}`}
                              onClick={() => {
                                if (!d) return
                                const pad = (n) => String(n).padStart(2, "0")
                                setEndDate(`${pad(d)}/${pad(endPickerMonth+1)}/${endPickerYear}`)
                                setShowEndPicker(false)
                              }}
                            >
                              {d||""}
                            </button>
                          ))
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Start Time</label>
                  <TimePicker value={startTime} onChange={setStartTime} />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">End Time</label>
                  <TimePicker value={endTime} onChange={setEndTime} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm text-gray-300">Frequency</label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-300">Color</span>
                    <input type="color" className="h-8 w-14 rounded bg-transparent border border-gray-800 p-1" value={eventColor} onChange={(e)=>setEventColor(e.target.value)} />
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 text-sm text-gray-300">
                    <Checkbox
                      checked={frequency.Daily}
                      onChange={(e) => setFrequency({ ...frequency, Daily: e.target.checked })}
                    />
                    <span>Daily</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-300">
                    <Checkbox
                      checked={frequency.Weekly}
                      onChange={(e) => setFrequency({ ...frequency, Weekly: e.target.checked })}
                    />
                    <span>Weekly</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-300">
                    <Checkbox
                      checked={frequency.Monthly}
                      onChange={(e) => setFrequency({ ...frequency, Monthly: e.target.checked })}
                    />
                    <span>Monthly</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button className="w-full" type="submit">Add Event</Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={closeEditModal} />
          <div className="relative z-10 w-full max-w-md rounded-xl border border-gray-800 bg-[#0f0f0f] p-6 shadow-xl">
            <h3 className="text-2xl font-semibold mb-4 text-center">Edit event</h3>
            <form onSubmit={handleEditEvent} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Event Name</label>
                <input className="w-full rounded-md bg-[#1a1a1a] border border-gray-800 px-3 py-2 text-sm outline-none focus:border-gray-600" value={newEventName} onChange={(e)=>setNewEventName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Type of Event</label>
                <input className="w-full rounded-md bg-[#1a1a1a] border border-gray-800 px-3 py-2 text-sm outline-none focus:border-gray-600" value={newEventType} onChange={(e)=>setNewEventType(e.target.value)} />
              </div>
              <div className="grid grid-cols-1 gap-3">
                <div className="relative">
                  <label className="block text-sm text-gray-300 mb-1">Start Date</label>
                  <input type="date" className="w-full rounded-md bg-[#1a1a1a] border border-gray-800 px-3 py-2 pr-10 text-sm outline-none focus:border-gray-600" value={startDate} onChange={(e)=>setStartDate(e.target.value)} ref={startDateRef} />
                  <Calendar className="absolute right-3 top-9 h-4 w-4 text-white cursor-pointer" onMouseDown={() => openNativePicker(startDateRef)} onClick={() => openNativePicker(startDateRef)} />
                </div>
                <div className="relative">
                  <label className="block text-sm text-gray-300 mb-1">End Date</label>
                  <input type="date" className="w-full rounded-md bg-[#1a1a1a] border border-gray-800 px-3 py-2 pr-10 text-sm outline-none focus:border-gray-600" value={endDate} onChange={(e)=>setEndDate(e.target.value)} ref={endDateRef} />
                  <Calendar className="absolute right-3 top-9 h-4 w-4 text-white cursor-pointer" onMouseDown={() => openNativePicker(endDateRef)} onClick={() => openNativePicker(endDateRef)} />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Start Time</label>
                  <TimePicker value={startTime} onChange={setStartTime} />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">End Time</label>
                  <TimePicker value={endTime} onChange={setEndTime} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm text-gray-300">Frequency</label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-300">Color</span>
                    <input type="color" className="h-8 w-14 rounded bg-transparent border border-gray-800 p-1" value={eventColor} onChange={(e)=>setEventColor(e.target.value)} />
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 text-sm text-gray-300">
                    <Checkbox checked={frequency.Daily} onChange={(e)=>setFrequency({ ...frequency, Daily: e.target.checked })} />
                    <span>Daily</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-300">
                    <Checkbox checked={frequency.Weekly} onChange={(e)=>setFrequency({ ...frequency, Weekly: e.target.checked })} />
                    <span>Weekly</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-300">
                    <Checkbox checked={frequency.Monthly} onChange={(e)=>setFrequency({ ...frequency, Monthly: e.target.checked })} />
                    <span>Monthly</span>
                  </label>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2 pt-2">
                <div>
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-red-500 hover:text-red-400 hover:bg-transparent"
                    onClick={() => handleDeleteEvent(editingEvent)}
                  >
                    Delete
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="ghost" onClick={closeEditModal}>Cancel</Button>
                  <Button type="submit">Save</Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

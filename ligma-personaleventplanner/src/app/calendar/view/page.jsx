"use client";

import { useState, useMemo, useContext, useEffect } from "react"
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
import { Menu, Search, Filter, Plus, ChevronLeft, ChevronRight, RefreshCw, LogOut, Settings } from "lucide-react"
import { UserAuthContext } from "../../context/auth-context"

const eventsByDay = {
  "10-2025": {
    2: [
      { id: "oct-1", name: "Team Meeting", time: "09:00", type: "Work" },
      { id: "oct-2", name: "Morning Workout", time: "07:00", type: "Daily" },
      { id: "oct-3", name: "Project Review", time: "14:00", type: "Work" },
    ],
  },
}

const todoItems = []

export default function CalendarViewPage() {
  const { user, signOut } = useContext(UserAuthContext)
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/")
    }
  }, [user, router])

  const [selectedDay, setSelectedDay] = useState(2)
  const [todos, setTodos] = useState(todoItems)
  const [currentMonth, setCurrentMonth] = useState(9) // 9 = October (0-indexed)
  const [currentYear, setCurrentYear] = useState(2025)

  const toggleTodo = (id) => {
    setTodos(todos.map((todo) => (todo.id === id ? { ...todo, checked: !todo.checked } : todo)))
  }

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
    const startDayOfWeek = (firstDay.getDay() + 6) % 7 // Convert to Mon=0, Sun=6

    const mini = []
    const full = []

    let day = 1
    let week = []

    // Fill first week with nulls before the first day
    for (let i = 0; i < startDayOfWeek; i++) {
      week.push(null)
    }

    // Fill in the days
    while (day <= daysInMonth) {
      week.push(day)
      if (week.length === 7) {
        mini.push([...week])
        full.push([...week])
        week = []
      }
      day++
    }

    // Fill last week with nulls
    if (week.length > 0) {
      while (week.length < 7) {
        week.push(null)
      }
      mini.push([...week])
      full.push([...week])
    }

    return { miniCalendarDays: mini, calendarGrid: full }
  }, [currentMonth, currentYear])

  const selectedDayEvents = useMemo(() => {
    const monthKey = `${currentMonth + 1}-${currentYear}`
    const monthEvents = eventsByDay[monthKey] || {}
    return monthEvents[selectedDay] || []
  }, [selectedDay, currentMonth, currentYear])

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

  if (!user)
    return (
      <div className="flex h-screen items-center justify-center bg-[#1a1a1a] text-white">Redirecting to login...</div>
    )

  return (
    <div className="flex h-screen bg-[#1a1a1a] text-white overflow-hidden">
      {/* Left Sidebar */}
      <div className="w-64 bg-[#0f0f0f] border-r border-gray-800 flex flex-col overflow-hidden">
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
                {week.map((day, dayIdx) => (
                  <button
                    key={dayIdx}
                    onClick={() => day && setSelectedDay(day)}
                    className={`
                      aspect-square text-xs rounded flex items-center justify-center
                      ${!day ? "invisible" : ""}
                      ${
                        day === selectedDay
                          ? "bg-[#4285f4] text-white"
                          : isToday(day)
                            ? "bg-[#4285f4]/20 text-[#4285f4]"
                            : "text-gray-400 hover:bg-[#4285f4]/10"
                      }
                    `}
                  >
                    {day}
                  </button>
                ))}
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
              <Button size="icon" variant="ghost" className="h-6 w-6">
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
                    className="flex items-start gap-2 p-2 rounded bg-[#1a1a1a] border-l-2"
                    style={{
                      borderLeftColor:
                        event.type === "Daily" ? "#10b981" : event.type === "Work" ? "#3b82f6" : "#f59e0b",
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-400">{event.time}</div>
                      <div className="text-sm">{event.name}</div>
                    </div>
                    <Badge variant="outline" className={`text-xs ${getEventBadgeColor(event.type)}`}>
                      {event.type}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* To-do List */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">To-do list</h2>
              <Button size="icon" variant="ghost" className="h-6 w-6">
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
                      onCheckedChange={() => toggleTodo(todo.id)}
                      className="border-gray-600"
                    />
                    <label
                      htmlFor={todo.id}
                      className={`text-sm cursor-pointer ${todo.checked ? "line-through text-gray-500" : ""}`}
                    >
                      {todo.label}
                    </label>
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
        <div className="h-16 border-b border-gray-800 flex items-center justify-between px-6">
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
              <Button size="icon" variant="ghost" onClick={goToToday}>
                <RefreshCw className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button size="icon" variant="ghost">
              <Search className="h-5 w-5" />
            </Button>
            <Button size="icon" variant="ghost">
              <Filter className="h-5 w-5" />
            </Button>
            <Button className="gap-2">
              Add event
              <Plus className="h-4 w-4" />
            </Button>
            {/* Dropdown menu to profile avatar */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 rounded-full p-0">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.photoURL} alt={user?.displayName || user?.email} />
                    <AvatarFallback>
                      {user?.displayName ? user.displayName[0].toUpperCase() : 
                       user?.email ? user.email[0].toUpperCase() : 'U'}
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
                  {week.map((day, dayIdx) => {
                    const monthKey = `${currentMonth + 1}-${currentYear}`
                    const monthEvents = eventsByDay[monthKey] || {}
                    const events = day ? monthEvents[day] || [] : []
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
                          ${!day ? "bg-[#0f0f0f]" : "bg-[#1a1a1a]"}
                          ${day === selectedDay ? "bg-[#1f2937]" : ""}
                        `}
                      >
                        {day && (
                          <>
                            {/* Day number and badges */}
                            <div className="flex items-start justify-between mb-2">
                              <span className={`text-sm font-medium ${isToday(day) ? "text-[#4285f4]" : ""}`}>
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
                                  <div
                                    className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${getEventDotColor(event.type)}`}
                                  />
                                  <span className="text-gray-400 truncate flex-1">{event.name}</span>
                                  <span className="text-gray-500 text-[10px] flex-shrink-0">{event.time}</span>
                                </div>
                              ))}
                              {moreCount > 0 && (
                                <button className="text-xs text-[#4285f4] hover:text-[#357ABD]">+{moreCount} More</button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

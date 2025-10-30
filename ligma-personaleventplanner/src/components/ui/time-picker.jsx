"use client";

export default function TimePicker({ value = "", onChange, className = "" }) {
  const pad = (n) => String(n).padStart(2, "0")
  const parse = (v) => {
    const m = /^\s*(\d{1,2})(?::(\d{2}))?\s*$/.exec(v || "")
    let h = 0, mm = 0
    if (m) {
      h = Math.max(0, Math.min(23, parseInt(m[1] || "0", 10)))
      mm = Math.max(0, Math.min(59, parseInt(m[2] || "0", 10)))
    }
    return [pad(h), pad(mm)]
  }
  const [hh, mm] = parse(value)

  const update = (newH = hh, newM = mm) => {
    onChange && onChange(`${newH}:${newM}`)
  }

  const hours = Array.from({ length: 24 }, (_, i) => pad(i))
  const minutes = Array.from({ length: 60 }, (_, i) => pad(i))

  return (
    <div className={`timepicker flex items-center gap-2 rounded-md border border-gray-800 bg-[#1a1a1a] px-2 py-1 ${className}`}>
      <select
        aria-label="Hour"
        className="bg-[#1a1a1a] text-white outline-none appearance-none pr-1"
        value={hh}
        onChange={(e) => update(pad(e.target.value), mm)}
      >
        {hours.map((h) => (
          <option key={h} value={h} style={{ backgroundColor: '#0f0f0f', color: '#ffffff' }}>{h}</option>
        ))}
      </select>
      <span className="text-gray-400">:</span>
      <select
        aria-label="Minute"
        className="bg-[#1a1a1a] text-white outline-none appearance-none pr-1"
        value={mm}
        onChange={(e) => update(hh, pad(e.target.value))}
      >
        {minutes.map((m) => (
          <option key={m} value={m} style={{ backgroundColor: '#0f0f0f', color: '#ffffff' }}>{m}</option>
        ))}
      </select>
    </div>
  )
}

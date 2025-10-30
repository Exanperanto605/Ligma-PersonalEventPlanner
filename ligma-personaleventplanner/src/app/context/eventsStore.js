"use client";

import { getFirestore, collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { app } from "./firebaseConfig";

const db = getFirestore(app);

// Helpers to normalize different schemas into a common shape used by the app
function rgbStringToHex(rgb) {
  if (!rgb) return undefined
  // expect "r,g,b"
  const parts = String(rgb).split(/\s*,\s*/).map((v) => parseInt(v, 10))
  if (parts.length !== 3 || parts.some((n) => isNaN(n))) return undefined
  const [r, g, b] = parts
  return `#${[r, g, b].map((n) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, "0")).join("")}`
}

function normalizeLegacyDoc(d, id) {
  // Accept both legacy field names (with spaces) and our current ones
  const startTs = d["Start Date"]?.toDate ? d["Start Date"].toDate() : (d.startDate ? new Date(d.startDate) : undefined)
  const endTs = d["End Date"]?.toDate ? d["End Date"].toDate() : (d.endDate ? new Date(d.endDate) : undefined)
  const toISO = (dt) => dt && !isNaN(dt.getTime()) ? `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,"0")}-${String(dt.getDate()).padStart(2,"0")}` : ""
  const toHM = (dt) => dt && !isNaN(dt.getTime()) ? `${String(dt.getHours()).padStart(2,"0")}:${String(dt.getMinutes()).padStart(2,"0")}` : ""
  const startDate = toISO(startTs)
  const endDate = toISO(endTs) || startDate
  const startTime = toHM(startTs)
  const endTime = toHM(endTs)
  const frequency = d["Frequency"] ? [String(d["Frequency"])].filter(Boolean) : (Array.isArray(d.frequency) ? d.frequency : [])
  const eventColor = d["Color"] ? rgbStringToHex(d["Color"]) : (d.eventColor || "#ffffff")
  const name = d["Event Name"] || d.name || ""
  const type = d["Type of Event"] || d.type || "Other"
  const time = startTime && endTime ? `${startTime}-${endTime}` : startTime || ""
  const priority = typeof d.priority === 'number' ? d.priority : undefined
  return { id, name, type, startDate, endDate, startTime, endTime, time, frequency, eventColor, origin: 'legacy', priority }
}

function normalizeNewDoc(d, id) {
  const name = d.name || ""
  const type = d.type || "Other"
  const startDate = d.startDate || ""
  const endDate = d.endDate || startDate
  const startTime = d.startTime || ""
  const endTime = d.endTime || ""
  const time = d.time || (startTime && endTime ? `${startTime}-${endTime}` : startTime || "")
  const frequency = Array.isArray(d.frequency) ? d.frequency : []
  const eventColor = d.eventColor || "#ffffff"
  const priority = typeof d.priority === 'number' ? d.priority : undefined
  return { id, name, type, startDate, endDate, startTime, endTime, time, frequency, eventColor, origin: 'new', priority }
}

// Subscribe to all events for a given user. Supports two schemas:
// 1) New: users/{uid}/events
// 2) Legacy: event_id_{uid}
export function subscribeUserEvents(uid, callback, onError) {
  const unsubs = []
  let newMap = new Map()
  let legacyMap = new Map()
  const recompute = () => {
    const merged = new Map()
    legacyMap.forEach((v, k) => merged.set(k, v))
    newMap.forEach((v, k) => merged.set(k, v))
    callback(Array.from(merged.values()))
  }

  // New schema
  try {
    const colRef = collection(db, "users", uid, "events")
    const q1 = query(colRef, orderBy("createdAt", "asc"))
    unsubs.push(onSnapshot(
      q1,
      (snap) => {
        const items = snap.docs.map((d) => normalizeNewDoc(d.data(), d.id))
        newMap = new Map(items.map((it) => [it.id, it]))
        recompute()
      },
      (err) => {
        if (onError) onError(err)
      }
    ))
  } catch (_) { /* ignore */ }

  // Legacy schema at root: event_id_{uid}
  try {
    const legacyCol = collection(db, `event_id_${uid}`)
    const q2 = query(legacyCol)
    unsubs.push(onSnapshot(
      q2,
      (snap) => {
        const items = snap.docs.map((d) => normalizeLegacyDoc(d.data(), d.id))
        legacyMap = new Map(items.map((it) => [it.id, it]))
        recompute()
      },
      (err) => {
        if (onError) onError(err)
      }
    ))
  } catch (_) { /* ignore */ }

  return () => unsubs.forEach((u) => u && typeof u === 'function' && u())
}

export async function addUserEvent(uid, data) {
  const colRef = collection(db, "users", uid, "events");
  const payload = { ...data, updatedAt: serverTimestamp(), createdAt: serverTimestamp() };
  const ref = await addDoc(colRef, payload);
  return ref.id;
}

export async function updateUserEvent(uid, id, data) {
  const ref = doc(db, "users", uid, "events", id);
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
}

export async function deleteUserEvent(uid, id) {
  const ref = doc(db, "users", uid, "events", id);
  await deleteDoc(ref);
}

export async function deleteLegacyUserEvent(uid, id) {
  const ref = doc(db, `event_id_${uid}`, id)
  await deleteDoc(ref)
}

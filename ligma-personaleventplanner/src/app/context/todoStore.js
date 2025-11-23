"use client";

import { getFirestore, collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { app } from "./firebaseConfig";

const db = getFirestore(app);

export function subscribeUserTodos(uid, callback, onError) {
  if (!uid) return () => {};
  try {
    const colRef = collection(db, "users", uid, "todos");
    const q = query(colRef, orderBy("createdAt", "asc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const items = snap.docs.map((d) => ({
          id: d.id,
          label: d.data()?.label || "",
          checked: !!d.data()?.checked,
          note: d.data()?.note || "",
        }));
        callback(items);
      },
      (err) => onError && onError(err)
    );
    return unsub;
  } catch (e) {
    if (onError) onError(e);
    return () => {};
  }
}

export async function addUserTodo(uid, label, note = "") {
  const colRef = collection(db, "users", uid, "todos");
  const payload = { label, note, checked: false, createdAt: serverTimestamp(), updatedAt: serverTimestamp() };
  const ref = await addDoc(colRef, payload);
  return ref.id;
}

export async function updateUserTodo(uid, id, data) {
  const ref = doc(db, "users", uid, "todos", id);
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
}

export async function deleteUserTodo(uid, id) {
  const ref = doc(db, "users", uid, "todos", id);
  await deleteDoc(ref);
}

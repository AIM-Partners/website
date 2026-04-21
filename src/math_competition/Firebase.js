import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, collection } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBOvcEPkqm3AQQRXtUMoKUXE26LvnC6Nrc",
  authDomain: "mental-math-competition-6264c.firebaseapp.com",
  projectId: "mental-math-competition-6264c",
  storageBucket: "mental-math-competition-6264c.firebasestorage.app",
  messagingSenderId: "909920596392",
  appId: "1:909920596392:web:e3fb23341979aeba7ded9d",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export const EVENT_ID = "aim_mental_math";

/* ── Round presets ─────────────────────────────────────────────
   Each round definition contains:
   - type: "solo" | "pvp"
   - sets: number of sets in this round
   - durationSec: seconds per set
   - breakSec: break between sets
   - questionType: "basic" | "compound3" | "compound4"
   - config: number ranges for question generation
   - cutPercent: what % to eliminate after this round (0 = no cut)
   - description: shown in admin UI
*/
export const ROUND_PRESETS = {
  1: {
    type: "solo",
    sets: 3,
    durationSec: 120,
    breakSec: 120,
    questionType: "basic",
    config: {
      ops: { add: true, sub: true, mul: true, div: true },
      addMin: 2, addMax: 100,
      mulAmin: 2, mulAmax: 12,
      mulBmin: 2, mulBmax: 100,
    },
    cutPercent: 20,
    description: "Warm-up: +/- [2,100], ×/÷ [2,12]×[2,100], 2min/set",
  },
  2: {
    type: "solo",
    sets: 2,
    durationSec: 180,
    breakSec: 120,
    questionType: "basic",
    config: {
      ops: { add: true, sub: true, mul: true, div: true },
      addMin: 100, addMax: 999,
      mulAmin: 2, mulAmax: 15,
      mulBmin: 2, mulBmax: 100,
    },
    cutPercent: 50,
    description: "Difficulty: +/- [100,999], ×/÷ [2,15]×[2,100]",
  },
  3: {
    type: "solo",
    sets: 2,
    durationSec: 300,
    breakSec: 120,
    questionType: "compound3",
    config: {
      mulAmin: 2, mulAmax: 19,
      mulBmin: 2, mulBmax: 50,
      addMin: 2, addMax: 100,
    },
    cutPercent: 75,
    cutToTopN: 10,
    description: "X×Y±Z: [2,19]×[2,50]±[2,100]",
  },
  4: {
    type: "solo",
    sets: 1,
    durationSec: 420,
    breakSec: 0,
    questionType: "compound3",
    config: {
      mulAmin: 2, mulAmax: 19,
      mulBmin: 2, mulBmax: 100,
      addMin: 2, addMax: 100,
    },
    cutPercent: 0,
    cutToTopN: 2,
    description: "Semi-Final: [2,19]×[2,100]±[2,100], Top 2 → Final",
    topN: 10,
  },
  5: {
    type: "pvp",
    sets: 1,
    durationSec: 420,
    breakSec: 0,
    questionType: "compound4",
    config: {
      mulAmin: 2, mulAmax: 19,
      mulBmin: 2, mulBmax: 100,
      addMin: 2, addMax: 100,
    },
    cutPercent: 0,
    description: "Final PVP: [2,19]×[2,100]±[2,19]×[2,100]",
    topN: 2,
  },
};

// ── Firestore refs ──────────────────────────────────────────

export function eventDocRef(eventId = EVENT_ID) {
  return doc(db, "events", eventId);
}
export function adminsColRef(eventId = EVENT_ID) {
  return collection(db, "events", eventId, "admins");
}
export function playersColRef(eventId = EVENT_ID) {
  return collection(db, "events", eventId, "players");
}
export function playerDocRef(uid, eventId = EVENT_ID) {
  return doc(db, "events", eventId, "players", uid);
}
export function scoresColRef(roundId, eventId = EVENT_ID) {
  return collection(db, "events", eventId, "rounds", String(roundId), "scores");
}
export function scoreDocRef(roundId, uid, eventId = EVENT_ID) {
  return doc(db, "events", eventId, "rounds", String(roundId), "scores", uid);
}

// PVP matches collection
export function matchesColRef(roundId, eventId = EVENT_ID) {
  return collection(db, "events", eventId, "rounds", String(roundId), "matches");
}
export function matchDocRef(roundId, matchId, eventId = EVENT_ID) {
  return doc(db, "events", eventId, "rounds", String(roundId), "matches", matchId);
}
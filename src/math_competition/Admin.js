import React, { useEffect, useState, useMemo } from "react";
import LoginBox from "./LoginBox";
import { auth, db, EVENT_ID, ROUND_PRESETS } from "./Firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  doc, onSnapshot, updateDoc, serverTimestamp,
  collection, query, where, getDocs, writeBatch, setDoc, deleteDoc,
} from "firebase/firestore";

function randCode() {
  const chars = "ABCDE";
  let code = "";
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export default function Admin() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [eventData, setEventData] = useState({});
  const [allPlayers, setAllPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [msg, setMsg] = useState("");
  const [tab, setTab] = useState("rounds"); // rounds | pvp | spectator
  const [timeLeft, setTimeLeft] = useState(0);
  const autoOvertimeRef = React.useRef(false);

  // ── Timer ──
  useEffect(() => {
    if (eventData?.phase === "running" && eventData?.endAt) {
      const interval = setInterval(() => {
        const end = eventData.endAt.toMillis ? eventData.endAt.toMillis() : new Date(eventData.endAt).getTime();
        const diff = Math.max(0, Math.floor((end - Date.now()) / 1000));
        setTimeLeft(diff);
      }, 250);
      return () => clearInterval(interval);
    } else {
      setTimeLeft(0);
    }
  }, [eventData]);

  // ── Auto end/overtime when timer hits 0 ──
  useEffect(() => {
    if (!isAdmin || eventData?.phase !== "running") return;
    if (timeLeft > 0) { autoOvertimeRef.current = false; return; }
    if (autoOvertimeRef.current) return; // already triggered

    // Check if endAt has actually passed
    const end = eventData.endAt?.toMillis ? eventData.endAt.toMillis() : new Date(eventData.endAt).getTime();
    if (Date.now() < end) return;

    const roundNum = eventData.currentRound;
    const p = ROUND_PRESETS[roundNum];
    if (!p) return;

    autoOvertimeRef.current = true;

    if (p.type === "pvp") {
      const runningMatches = matches.filter(m => m.status === "running");
      if (runningMatches.length > 0) {
        handleAutoEndMatches(runningMatches, roundNum);
      }
    } else {
      // Solo: auto end set
      handleAutoEndSet();
    }
  }, [timeLeft, matches, eventData, isAdmin]);

  // ── Auth ──
  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const snap = await getDocs(query(collection(db, "events", EVENT_ID, "admins"), where("__name__", "==", u.uid)));
        setIsAdmin(!snap.empty);
      }
    });
  }, []);

  // ── Event doc ──
  useEffect(() => {
    if (!isAdmin) return;
    return onSnapshot(doc(db, "events", EVENT_ID), (snap) => {
      setEventData(snap.data() || {});
    });
  }, [isAdmin]);

  // ── Players ──
  useEffect(() => {
    if (!isAdmin) return;
    return onSnapshot(query(collection(db, "events", EVENT_ID, "players")), (snap) => {
      const all = [];
      snap.forEach((d) => all.push({ ...d.data(), id: d.id }));
      setAllPlayers(all);
    });
  }, [isAdmin]);

  // ── Matches for current round (PVP) ──
  useEffect(() => {
    if (!isAdmin || !eventData.currentRound) return;
    const roundNum = eventData.currentRound;
    const preset = ROUND_PRESETS[roundNum];
    if (!preset || preset.type !== "pvp") { setMatches([]); return; }

    return onSnapshot(
      collection(db, "events", EVENT_ID, "rounds", String(roundNum), "matches"),
      (snap) => {
        const m = [];
        snap.forEach((d) => m.push({ ...d.data(), id: d.id }));
        setMatches(m);
      }
    );
  }, [isAdmin, eventData.currentRound]);

  const currentRound = eventData.currentRound || 1;
  const preset = ROUND_PRESETS[currentRound] || ROUND_PRESETS[1];
  const survivors = useMemo(() => allPlayers.filter((p) => p.status !== "eliminated"), [allPlayers]);

  // ── Actions ──

  const toggleRegistration = async () => {
    try {
      const newVal = !eventData.registrationOpen;
      await updateDoc(doc(db, "events", EVENT_ID), { registrationOpen: newVal });
      setMsg(`Registration ${newVal ? "OPEN" : "CLOSED"}`);
    } catch (e) { setMsg("Error: " + e.message); }
  };

  // Initialize/re-initialize current round with preset fields
  const initCurrentRound = async () => {
    const p = ROUND_PRESETS[currentRound];
    if (!p) { setMsg("No preset for round " + currentRound); return; }
    const newCode = randCode();
    const batch = writeBatch(db);
    allPlayers.forEach((pl) => {
      if (pl.id) batch.update(doc(db, "events", EVENT_ID, "players", pl.id), { readyForRound: false, roundScore: 0, tabLeaveCount: 0 });
    });
    batch.update(doc(db, "events", EVENT_ID), {
      currentRound: currentRound,
      roundCode: newCode,
      phase: "lobby",
      currentSet: 1,
      questionType: p.questionType,
      config: p.config,
      durationSec: p.durationSec,
      roundType: p.type,
      updatedAt: serverTimestamp(),
    });
    await batch.commit();
    setMsg(`Round ${currentRound} initialized. Code: ${newCode}`);
  };

  const moveToNextRound = async () => {
    const nextRound = currentRound + 1;
    if (!ROUND_PRESETS[nextRound]) { setMsg("No more rounds defined!"); return; }
    if (!window.confirm(`Move to Round ${nextRound}?`)) return;
    setMsg("Processing...");
    try {
      const newCode = randCode();
      const batch = writeBatch(db);
      allPlayers.forEach((p) => {
        if (p.id) batch.update(doc(db, "events", EVENT_ID, "players", p.id), { readyForRound: false, roundScore: 0, tabLeaveCount: 0 });
      });
      const nextPreset = ROUND_PRESETS[nextRound];
      batch.update(doc(db, "events", EVENT_ID), {
        currentRound: nextRound,
        roundCode: newCode,
        phase: "lobby",
        currentSet: 1,
        questionType: nextPreset.questionType,
        config: nextPreset.config,
        durationSec: nextPreset.durationSec,
        roundType: nextPreset.type,
        updatedAt: serverTimestamp(),
      });
      await batch.commit();
      setMsg(`Round ${nextRound} ready. Code: ${newCode}`);
    } catch (e) { setMsg("Error: " + e.message); }
  };

  const startSet = async () => {
    const dur = preset.durationSec;
    const endAt = new Date(Date.now() + dur * 1000);
    await updateDoc(doc(db, "events", EVENT_ID), {
      phase: "running",
      endAt,
      startAt: serverTimestamp(),
    });
    setMsg(`Set ${eventData.currentSet || 1} started! (${dur}s)`);
  };

  const endSet = async () => {
    const currentSet = eventData.currentSet || 1;
    const totalSets = preset.sets || 1;
    if (currentSet < totalSets) {
      await updateDoc(doc(db, "events", EVENT_ID), {
        phase: "break",
        currentSet: currentSet + 1,
        updatedAt: serverTimestamp(),
      });
      setMsg(`Set ${currentSet} ended. Break time! Next: Set ${currentSet + 1}`);
    } else {
      await updateDoc(doc(db, "events", EVENT_ID), { phase: "ended", updatedAt: serverTimestamp() });
      setMsg(`All sets for Round ${currentRound} complete.`);
    }
  };

  const handleAutoEndSet = async () => {
    try {
      const currentSet = eventData.currentSet || 1;
      const totalSets = preset.sets || 1;
      if (currentSet < totalSets) {
        await updateDoc(doc(db, "events", EVENT_ID), {
          phase: "break",
          currentSet: currentSet + 1,
          updatedAt: serverTimestamp(),
        });
        setMsg(`⏱ Auto: Set ${currentSet} ended. Break time!`);
      } else {
        await updateDoc(doc(db, "events", EVENT_ID), { phase: "ended", updatedAt: serverTimestamp() });
        setMsg(`⏱ Auto: All sets for Round ${currentRound} complete.`);
      }
    } catch (e) {
      console.error("Auto end set error:", e);
      setMsg("Auto-end error: " + e.message);
    }
  };

  const forceEnd = async () => {
    await updateDoc(doc(db, "events", EVENT_ID), { phase: "ended", updatedAt: serverTimestamp() });
    setMsg("Round force-ended.");
  };

  // ── Elimination ──
  // Tiebreaker sort: totalScore desc → roundScore desc → lastScoreAt asc (earlier = better)
  const tiebreakSort = (a, b) => {
    const scoreDiff = (b.totalScore || 0) - (a.totalScore || 0);
    if (scoreDiff !== 0) return scoreDiff;
    const roundDiff = (b.roundScore || 0) - (a.roundScore || 0);
    if (roundDiff !== 0) return roundDiff;
    const aTime = a.lastScoreAt?.toMillis ? a.lastScoreAt.toMillis() : (a.lastScoreAt || Infinity);
    const bTime = b.lastScoreAt?.toMillis ? b.lastScoreAt.toMillis() : (b.lastScoreAt || Infinity);
    return aTime - bTime; // earlier = higher rank
  };

  const performCutoff = async (percent) => {
    const alive = allPlayers.filter((p) => p.status !== "eliminated");
    const toKeep = Math.ceil(alive.length * (1 - percent / 100));
    if (alive.length <= toKeep) { setMsg("Not enough players to cut."); return; }

    if (currentRound === 1) {
      // Round 1: save all ties at cutline
      alive.sort(tiebreakSort);
      const threshold = alive[toKeep - 1]?.totalScore ?? 0;
      const actualKeep = alive.filter(p => (p.totalScore || 0) >= threshold).length;
      if (!window.confirm(`R1: Keep ${actualKeep} of ${alive.length} (all ties saved)?`)) return;
      const batch = writeBatch(db);
      let count = 0;
      alive.forEach((p) => {
        if (p.id && (p.totalScore || 0) < threshold) {
          batch.update(doc(db, "events", EVENT_ID, "players", p.id), { status: "eliminated" });
          count++;
        }
      });
      await batch.commit();
      setMsg(`R1: Eliminated ${count}. ${alive.length - count} remain (ties saved).`);
    } else {
      // Round 2+: full tiebreaker
      alive.sort(tiebreakSort);
      if (!window.confirm(`Keep top ${toKeep} of ${alive.length} (cut ${percent}%)?\nTiebreaker: roundScore → speed`)) return;
      const batch = writeBatch(db);
      let count = 0;
      alive.forEach((p, i) => {
        if (p.id && i >= toKeep) {
          batch.update(doc(db, "events", EVENT_ID, "players", p.id), { status: "eliminated" });
          count++;
        }
      });
      await batch.commit();
      setMsg(`Eliminated ${count}. ${toKeep} remain.`);
    }
  };

  // Cut to exact top N (with tiebreaker)
  const [customTopN, setCustomTopN] = useState(10);
  const performCutToTopN = async (topN) => {
    const alive = allPlayers.filter((p) => p.status !== "eliminated");
    if (alive.length <= topN) { setMsg(`Only ${alive.length} alive, ≤ ${topN}.`); return; }
    if (!window.confirm(`Keep ONLY top ${topN} of ${alive.length}?\nTiebreaker: roundScore → speed`)) return;
    alive.sort(tiebreakSort);
    const batch = writeBatch(db);
    let count = 0;
    alive.forEach((p, i) => {
      if (p.id && i >= topN) {
        batch.update(doc(db, "events", EVENT_ID, "players", p.id), { status: "eliminated" });
        count++;
      }
    });
    await batch.commit();
    setMsg(`Eliminated ${count}. Top ${topN} remain.`);
  };

  // Eliminate players with tab leave count >= threshold
  const [tabCutoff, setTabCutoff] = useState(3);
  const eliminateByTabLeave = async (threshold) => {
    const targets = allPlayers.filter(p => p.status !== "eliminated" && (p.tabLeaveCount || 0) >= threshold);
    if (targets.length === 0) { setMsg(`No alive players with tab leave ≥ ${threshold}.`); return; }
    if (!window.confirm(`Eliminate ${targets.length} player(s) with tab leave ≥ ${threshold}?`)) return;
    const batch = writeBatch(db);
    targets.forEach(p => {
      if (p.id) batch.update(doc(db, "events", EVENT_ID, "players", p.id), { status: "eliminated" });
    });
    await batch.commit();
    setMsg(`Eliminated ${targets.length} player(s) for tab switching.`);
  };

  // ── PVP Bracket Generation ──
  const generateBracket = async () => {
    const topN = preset.topN || 10;
    const alive = allPlayers
      .filter((p) => p.status !== "eliminated")
      .sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0))
      .slice(0, topN);

    if (alive.length < 2) { setMsg("Need at least 2 players for PVP."); return; }
    if (!window.confirm(`Generate bracket for top ${alive.length} players?`)) return;

    // Seed matching: 1 vs N, 2 vs N-1, etc.
    const matchList = [];
    const half = Math.ceil(alive.length / 2);
    for (let i = 0; i < half; i++) {
      const p1 = alive[i];
      const p2 = alive[alive.length - 1 - i];
      if (p1 && p2 && p1.id !== p2.id) {
        matchList.push({
          matchNum: i + 1,
          player1: { uid: p1.id, name: p1.name || p1.email, seed: i + 1 },
          player2: { uid: p2.id, name: p2.name || p2.email, seed: alive.length - i },
          score1: 0,
          score2: 0,
          status: "pending", // pending | running | finished
          winner: null,
          // Shared seed for identical question sequences
          questionSeed: Math.floor(Math.random() * 2147483647),
          questionIndex: 0,
        });
      }
    }

    // If odd number, last person gets a bye
    if (alive.length % 2 === 1) {
      const byePlayer = alive[half - 1];
      matchList[matchList.length - 1] = {
        ...matchList[matchList.length - 1],
        isBye: true,
        winner: byePlayer.id,
        status: "finished",
      };
    }

    const batch = writeBatch(db);
    // Clear old matches
    const oldSnap = await getDocs(collection(db, "events", EVENT_ID, "rounds", String(currentRound), "matches"));
    oldSnap.forEach((d) => batch.delete(d.ref));

    matchList.forEach((m) => {
      const ref = doc(collection(db, "events", EVENT_ID, "rounds", String(currentRound), "matches"));
      batch.set(ref, m);
    });

    await batch.commit();
    setMsg(`Generated ${matchList.length} matches for Round ${currentRound}.`);
  };

  const startMatch = async (matchId) => {
    const dur = preset.durationSec;
    const endAt = new Date(Date.now() + dur * 1000);
    await updateDoc(
      doc(db, "events", EVENT_ID, "rounds", String(currentRound), "matches", matchId),
      { status: "running", endAt, startAt: serverTimestamp() }
    );
    // Also set event phase to running for the timer
    await updateDoc(doc(db, "events", EVENT_ID), { phase: "running", endAt, startAt: serverTimestamp() });
    setMsg("Match started!");
  };

  const OVERTIME_SEC = 60; // 1 minute overtime

  // Auto-end all running matches (called when timer expires)
  const handleAutoEndMatches = async (runningMatches, roundNum) => {
    try {
      const batch = writeBatch(db);
      let tieCount = 0;
      let endAt;

      runningMatches.forEach(m => {
        const s1 = m.score1 || 0;
        const s2 = m.score2 || 0;
        if (s1 === s2) {
          const overtimeCount = (m.overtimeCount || 0) + 1;
          endAt = new Date(Date.now() + OVERTIME_SEC * 1000);
          batch.update(doc(db, "events", EVENT_ID, "rounds", String(roundNum), "matches", m.id), {
            status: "running", endAt, startAt: serverTimestamp(), overtimeCount,
          });
          tieCount++;
        } else {
          const winner = s1 > s2 ? m.player1.uid : m.player2.uid;
          batch.update(doc(db, "events", EVENT_ID, "rounds", String(roundNum), "matches", m.id), {
            status: "finished", winner,
          });
        }
      });

      if (tieCount > 0) {
        batch.update(doc(db, "events", EVENT_ID), { phase: "running", endAt, startAt: serverTimestamp() });
        await batch.commit();
        setMsg(`⏱ Auto: ${tieCount} tie(s) → Overtime ${OVERTIME_SEC}s!`);
      } else {
        batch.update(doc(db, "events", EVENT_ID), { phase: "ended", updatedAt: serverTimestamp() });
        await batch.commit();
        setMsg("⏱ Auto: All matches ended!");
      }
    } catch (e) {
      console.error("Auto end error:", e);
      setMsg("Auto-end error: " + e.message);
    }
  };

  const endMatch = async (matchId) => {
    const match = matches.find((m) => m.id === matchId);
    if (!match) return;
    const s1 = match.score1 || 0;
    const s2 = match.score2 || 0;

    if (s1 === s2) {
      // TIE → auto overtime
      const overtimeCount = (match.overtimeCount || 0) + 1;
      const endAt = new Date(Date.now() + OVERTIME_SEC * 1000);
      await updateDoc(
        doc(db, "events", EVENT_ID, "rounds", String(currentRound), "matches", matchId),
        { status: "running", endAt, startAt: serverTimestamp(), overtimeCount }
      );
      await updateDoc(doc(db, "events", EVENT_ID), { phase: "running", endAt, startAt: serverTimestamp() });
      setMsg(`Match ${match.matchNum}: TIE ${s1}-${s2}! Overtime #${overtimeCount} (${OVERTIME_SEC}s)`);
    } else {
      const winner = s1 > s2 ? match.player1.uid : match.player2.uid;
      await updateDoc(
        doc(db, "events", EVENT_ID, "rounds", String(currentRound), "matches", matchId),
        { status: "finished", winner }
      );
      setMsg(`Match ${match.matchNum}: Winner ${winner === match.player1.uid ? match.player1.name : match.player2.name} (${Math.max(s1,s2)}-${Math.min(s1,s2)})`);
    }
  };

  const startAllMatches = async () => {
    const dur = preset.durationSec;
    const endAt = new Date(Date.now() + dur * 1000);
    const batch = writeBatch(db);
    matches.filter(m => m.status === "pending").forEach(m => {
      batch.update(doc(db, "events", EVENT_ID, "rounds", String(currentRound), "matches", m.id), {
        status: "running", endAt, startAt: serverTimestamp(),
      });
    });
    batch.update(doc(db, "events", EVENT_ID), { phase: "running", endAt, startAt: serverTimestamp() });
    await batch.commit();
    setMsg("All matches started!");
  };

  const endAllMatches = async () => {
    const batch = writeBatch(db);
    let tieCount = 0;
    matches.filter(m => m.status === "running").forEach(m => {
      const s1 = m.score1 || 0;
      const s2 = m.score2 || 0;
      if (s1 === s2) {
        // Tie: auto overtime
        const overtimeCount = (m.overtimeCount || 0) + 1;
        const endAt = new Date(Date.now() + OVERTIME_SEC * 1000);
        batch.update(doc(db, "events", EVENT_ID, "rounds", String(currentRound), "matches", m.id), {
          status: "running", endAt, startAt: serverTimestamp(), overtimeCount,
        });
        tieCount++;
      } else {
        const winner = s1 > s2 ? m.player1.uid : m.player2.uid;
        batch.update(doc(db, "events", EVENT_ID, "rounds", String(currentRound), "matches", m.id), {
          status: "finished", winner,
        });
      }
    });

    if (tieCount > 0) {
      // Keep event running for overtime matches
      const endAt = new Date(Date.now() + OVERTIME_SEC * 1000);
      batch.update(doc(db, "events", EVENT_ID), { phase: "running", endAt, startAt: serverTimestamp() });
      await batch.commit();
      setMsg(`${tieCount} match(es) tied → Overtime ${OVERTIME_SEC}s! Others finished.`);
    } else {
      batch.update(doc(db, "events", EVENT_ID), { phase: "ended", updatedAt: serverTimestamp() });
      await batch.commit();
      setMsg("All matches ended!");
    }
  };

  // ── Reset ──
  const deleteAllMatches = async () => {
    if (!window.confirm("Delete ALL matches for all rounds?")) return;
    try {
      // Delete matches for rounds 1-5
      for (let r = 1; r <= 5; r++) {
        const snap = await getDocs(collection(db, "events", EVENT_ID, "rounds", String(r), "matches"));
        if (!snap.empty) {
          const batch = writeBatch(db);
          snap.forEach((d) => batch.delete(d.ref));
          await batch.commit();
        }
      }
      await updateDoc(doc(db, "events", EVENT_ID), { phase: "lobby", updatedAt: serverTimestamp() });
      setMsg("All matches deleted.");
    } catch (e) {
      setMsg("Error: " + e.message);
    }
  };

  const resetCompetition = async () => {
    if (!window.confirm("WARNING: DELETE ALL PLAYERS AND MATCH DATA?")) return;
    setMsg("Resetting...");
    try {
      const batch = writeBatch(db);
      allPlayers.forEach((p) => { if (p.id) batch.delete(doc(db, "events", EVENT_ID, "players", p.id)); });
      batch.update(doc(db, "events", EVENT_ID), {
        phase: "idle", roundCode: "", currentRound: 1, currentSet: 1,
        registrationOpen: true, roundType: "solo",
        questionType: ROUND_PRESETS[1].questionType,
        config: ROUND_PRESETS[1].config,
        durationSec: ROUND_PRESETS[1].durationSec,
      });
      await batch.commit();
      setMsg("Reset complete.");
    } catch (e) { setMsg("Error: " + e.message); }
  };

  // ── Render ──
  if (!user) return <LoginBox mode="admin" />;
  if (!isAdmin) return <div style={{ padding: 20 }}>Access Denied.</div>;

  return (
    <div style={{ padding: 30, fontFamily: "sans-serif", maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ margin: 0 }}>Admin Console</h1>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button onClick={toggleRegistration} style={{
            ...btnPrimary,
            background: eventData.registrationOpen ? "#22c55e" : "#ef4444",
          }}>
            {eventData.registrationOpen ? "Reg OPEN" : "Reg CLOSED"}
          </button>
          <button onClick={() => signOut(auth)} style={btnSecondary}>Sign Out</button>
        </div>
      </div>

      {msg && <div style={{ background: "#dcfce7", padding: 10, borderRadius: 6, marginBottom: 15, color: "#166534", fontWeight: 600 }}>{msg}</div>}

      {/* Status Bar */}
      <div style={{ display: "flex", gap: 15, marginBottom: 20, flexWrap: "wrap" }}>
        <StatusBadge label="Round" value={currentRound} />
        <StatusBadge label="Type" value={preset.type.toUpperCase()} color={preset.type === "pvp" ? "#dc2626" : "#2563eb"} />
        <StatusBadge label="Phase" value={(eventData.phase || "idle").toUpperCase()} />
        <StatusBadge label="Set" value={`${eventData.currentSet || 1}/${preset.sets}`} />
        {eventData.phase === "running" && (
          <div style={{
            background: timeLeft < 10 ? "#fef2f2" : timeLeft < 30 ? "#fefce8" : "#f0fdf4",
            border: `2px solid ${timeLeft < 10 ? "#ef4444" : timeLeft < 30 ? "#f59e0b" : "#22c55e"}`,
            borderRadius: 8, padding: "8px 16px", fontSize: 20, fontWeight: 900,
            color: timeLeft < 10 ? "#ef4444" : timeLeft < 30 ? "#f59e0b" : "#16a34a",
            fontVariantNumeric: "tabular-nums",
          }}>
            ⏱ {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
          </div>
        )}
        <StatusBadge label="Code" value={eventData.roundCode || "NONE"} color="#2563eb" />
        <StatusBadge label="Alive" value={survivors.length} color="#16a34a" />
        <StatusBadge label="Total" value={allPlayers.length} />
      </div>

      {/* Round Description */}
      <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 8, padding: 12, marginBottom: 20, fontSize: 14 }}>
        <strong>Round {currentRound}:</strong> {preset.description}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, marginBottom: 20 }}>
        {["rounds", "pvp", "spectator", "players"].map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "10px 20px", border: "1px solid #ddd", borderBottom: tab === t ? "2px solid #2563eb" : "1px solid #ddd",
            background: tab === t ? "#eff6ff" : "white", fontWeight: tab === t ? 800 : 400,
            cursor: "pointer", textTransform: "capitalize",
          }}>{t}</button>
        ))}
      </div>

      {/* ─── Tab: Rounds (Solo + General Controls) ─── */}
      {tab === "rounds" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div>
            <section style={cardStyle}>
              <h3>Round Control</h3>
              
              {/* Live Timer */}
              {eventData.phase === "running" && (
                <div style={{
                  textAlign: "center", padding: "15px 0", marginBottom: 15,
                  background: timeLeft < 10 ? "#fef2f2" : timeLeft < 30 ? "#fefce8" : "#f0fdf4",
                  borderRadius: 8, border: `2px solid ${timeLeft < 10 ? "#ef4444" : timeLeft < 30 ? "#f59e0b" : "#22c55e"}`,
                }}>
                  <div style={{ fontSize: 14, color: "#666", marginBottom: 4 }}>
                    Set {eventData.currentSet || 1}/{preset.sets} — Time Remaining
                  </div>
                  <div style={{
                    fontSize: 48, fontWeight: 900, fontVariantNumeric: "tabular-nums",
                    color: timeLeft < 10 ? "#ef4444" : timeLeft < 30 ? "#f59e0b" : "#16a34a",
                  }}>
                    {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
                  </div>
                </div>
              )}
              {eventData.phase === "break" && (
                <div style={{
                  textAlign: "center", padding: "15px 0", marginBottom: 15,
                  background: "#fefce8", borderRadius: 8, border: "2px solid #f59e0b",
                }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: "#854d0e" }}>☕ BREAK TIME</div>
                  <div style={{ fontSize: 13, color: "#854d0e" }}>Next: Set {eventData.currentSet || 2}</div>
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                <button onClick={startSet} style={{ ...btnPrimary, background: "#16a34a" }}>
                  ▶ Start Set {eventData.currentSet || 1}
                </button>
                <button onClick={endSet} style={{ ...btnPrimary, background: "#dc2626" }}>
                  ⏹ End Set
                </button>
              </div>
              <button onClick={initCurrentRound} style={{ ...btnSecondary, width: "100%", marginBottom: 10, border: "2px solid #7c3aed", color: "#7c3aed" }}>
                🔄 Init Round {currentRound} (Reset Sets & Code)
              </button>
              <button onClick={moveToNextRound} style={{ ...btnPrimary, background: "#2563eb", width: "100%", padding: 14, fontSize: 15 }}>
                ⏭️ NEXT ROUND
              </button>
              <button onClick={forceEnd} style={{ ...btnSecondary, width: "100%", marginTop: 10 }}>
                Force End Round
              </button>
            </section>

            <section style={cardStyle}>
              <h3>Elimination</h3>
              <p style={{ fontSize: 13, color: "#666", margin: "0 0 10px" }}>
                Preset cut for this round: {preset.cutPercent}%
              </p>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => performCutoff(preset.cutPercent)} style={{ ...btnPrimary, background: "#f59e0b", flex: 1 }}>
                  Cut {preset.cutPercent}% (Preset)
                </button>
                <button onClick={() => performCutoff(50)} style={{ ...btnSecondary, flex: 1 }}>Cut 50%</button>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 10, alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>Keep Top:</span>
                <input type="number" value={customTopN} onChange={e => setCustomTopN(Number(e.target.value))}
                  style={{ width: 60, padding: 6, borderRadius: 4, border: "1px solid #ddd", textAlign: "center" }} />
                <button onClick={() => performCutToTopN(customTopN)} style={{ ...btnPrimary, background: "#7c3aed", flex: 1 }}>
                  Cut to Top {customTopN}
                </button>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 10, alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>⚠️ Tab ≥</span>
                <input type="number" value={tabCutoff} onChange={e => setTabCutoff(Number(e.target.value))}
                  style={{ width: 60, padding: 6, borderRadius: 4, border: "1px solid #ddd", textAlign: "center" }} />
                <button onClick={() => eliminateByTabLeave(tabCutoff)} style={{ ...btnPrimary, background: "#ef4444", flex: 1 }}>
                  Eliminate Tab ≥ {tabCutoff}
                </button>
              </div>
              <button onClick={resetCompetition} style={{ ...btnSecondary, borderColor: "red", color: "red", width: "100%", marginTop: 10 }}>
                RESET ALL
              </button>
            </section>
          </div>

          <section style={cardStyle}>
            <h3>Round Presets Overview</h3>
            <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #eee" }}>
                  <th style={thStyle}>R#</th><th style={thStyle}>Type</th><th style={thStyle}>Sets</th>
                  <th style={thStyle}>Dur</th><th style={thStyle}>Q Type</th><th style={thStyle}>Cut</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(ROUND_PRESETS).map(([num, p]) => (
                  <tr key={num} style={{
                    borderBottom: "1px solid #f0f0f0",
                    background: Number(num) === currentRound ? "#eff6ff" : "white",
                    fontWeight: Number(num) === currentRound ? 700 : 400,
                  }}>
                    <td style={tdStyle}>{num}</td>
                    <td style={tdStyle}>{p.type}</td>
                    <td style={tdStyle}>{p.sets}</td>
                    <td style={tdStyle}>{p.durationSec}s</td>
                    <td style={tdStyle}>{p.questionType}</td>
                    <td style={tdStyle}>{p.cutPercent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      )}

      {/* ─── Tab: PVP ─── */}
      {tab === "pvp" && (
        <div>
          <section style={cardStyle}>
            <h3>PVP Bracket — Round {currentRound}</h3>
            {preset.type !== "pvp" ? (
              <p style={{ color: "#999" }}>This round is not a PVP round. Switch to a PVP round first.</p>
            ) : (
              <>
                <div style={{ display: "flex", gap: 10, marginBottom: 15 }}>
                  <button onClick={generateBracket} style={{ ...btnPrimary, background: "#7c3aed" }}>
                    Generate Bracket (Top {preset.topN})
                  </button>
                  <button onClick={startAllMatches} style={{ ...btnPrimary, background: "#16a34a" }}>
                    ▶ Start All Matches
                  </button>
                  <button onClick={endAllMatches} style={{ ...btnPrimary, background: "#dc2626" }}>
                    ⏹ End All Matches
                  </button>
                  <button onClick={deleteAllMatches} style={{ ...btnSecondary, borderColor: "#dc2626", color: "#dc2626" }}>
                    🗑 Delete All Matches
                  </button>
                </div>

                {matches.length === 0 ? (
                  <p style={{ color: "#999" }}>No matches yet. Generate a bracket first.</p>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15 }}>
                    {matches.sort((a, b) => a.matchNum - b.matchNum).map((m) => (
                      <div key={m.id} style={{
                        border: `2px solid ${m.status === "running" ? "#22c55e" : m.status === "finished" ? "#94a3b8" : "#ddd"}`,
                        borderRadius: 10, padding: 15, background: m.status === "running" ? "#f0fdf4" : "white",
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                          <span style={{ fontWeight: 700 }}>
                            Match {m.matchNum}
                            {m.overtimeCount > 0 && <span style={{ color: "#f59e0b", marginLeft: 5 }}>OT{m.overtimeCount}</span>}
                          </span>
                          <span style={{
                            fontSize: 12, padding: "2px 8px", borderRadius: 4,
                            background: m.status === "running" ? "#22c55e" : m.status === "finished" ? "#94a3b8" : "#fbbf24",
                            color: "white", fontWeight: 700,
                          }}>{m.status.toUpperCase()}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                          <div style={{ fontWeight: m.winner === m.player1?.uid ? 800 : 400 }}>
                            #{m.player1?.seed} {m.player1?.name}
                          </div>
                          <div style={{ fontSize: 24, fontWeight: 900 }}>{m.score1 || 0}</div>
                        </div>
                        <div style={{ textAlign: "center", fontSize: 12, color: "#999", margin: "4px 0" }}>VS</div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                          <div style={{ fontWeight: m.winner === m.player2?.uid ? 800 : 400 }}>
                            #{m.player2?.seed} {m.player2?.name}
                          </div>
                          <div style={{ fontSize: 24, fontWeight: 900 }}>{m.score2 || 0}</div>
                        </div>
                        {m.status === "pending" && (
                          <button onClick={() => startMatch(m.id)} style={{ ...btnPrimary, background: "#16a34a", width: "100%", padding: 8 }}>Start</button>
                        )}
                        {m.status === "running" && (
                          <button onClick={() => endMatch(m.id)} style={{ ...btnPrimary, background: "#dc2626", width: "100%", padding: 8 }}>End Match</button>
                        )}
                        {m.status === "finished" && m.winner && (
                          <div style={{ textAlign: "center", fontWeight: 700, color: "#16a34a" }}>
                            Winner: {m.winner === m.player1?.uid ? m.player1?.name : m.player2?.name}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      )}

      {/* ─── Tab: Spectator (Projector View Link) ─── */}
      {tab === "spectator" && (
        <section style={cardStyle}>
          <h3>Spectator / Projector View</h3>
          <p style={{ color: "#666", marginBottom: 15 }}>
            Open this component in a separate window/tab for the projector display.
          </p>
          <SpectatorPreview eventData={eventData} matches={matches} allPlayers={allPlayers} preset={preset} currentRound={currentRound} />
        </section>
      )}

      {/* ─── Tab: Players ─── */}
      {tab === "players" && (
        <section style={cardStyle}>
          <h3>All Players ({allPlayers.length} total, {survivors.length} alive)</h3>
          <div style={{ maxHeight: 600, overflowY: "auto" }}>
            <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
              <thead><tr><th style={thStyle}>#</th><th style={thStyle}>Name</th><th style={thStyle}>Score</th><th style={thStyle}>Round</th><th style={thStyle}>Status</th><th style={thStyle}>Ready</th><th style={thStyle}>⚠️ Tab</th></tr></thead>
              <tbody>
                {allPlayers.sort(tiebreakSort).map((p, i) => (
                  <tr key={p.id} style={{
                    borderBottom: "1px solid #f0f0f0",
                    color: p.status === "eliminated" ? "#ef4444" : "inherit",
                    textDecoration: p.status === "eliminated" ? "line-through" : "none",
                  }}>
                    <td style={tdStyle}>{i + 1}</td>
                    <td style={tdStyle}>{p.name || p.email}</td>
                    <td style={tdStyle}>{p.totalScore || 0}</td>
                    <td style={tdStyle}>{p.roundScore || 0}</td>
                    <td style={tdStyle}>{p.status === "eliminated" ? "OUT" : "Alive"}</td>
                    <td style={tdStyle}>{p.readyForRound ? "✅" : "—"}</td>
                    <td style={{ ...tdStyle, color: (p.tabLeaveCount || 0) > 0 ? "#ef4444" : "#22c55e", fontWeight: 700 }}>
                      {p.tabLeaveCount || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

// ── Spectator Preview (embedded in admin, also usable standalone) ──
function SpectatorPreview({ eventData, matches, allPlayers, preset, currentRound }) {
  if (preset.type === "pvp" && matches.length > 0) {
    return (
      <div style={{ background: "#0f172a", color: "white", borderRadius: 12, padding: 30, minHeight: 400 }}>
        <h2 style={{ textAlign: "center", margin: "0 0 5px", fontSize: 28 }}>
          {currentRound === 5 ? "🏆 FINAL" : "⚔️ SEMI-FINAL"} — Round {currentRound}
        </h2>
        <p style={{ textAlign: "center", color: "#94a3b8", margin: "0 0 25px" }}>{preset.description}</p>
        <div style={{ display: "grid", gridTemplateColumns: matches.length <= 2 ? "1fr" : "1fr 1fr", gap: 20 }}>
          {matches.sort((a, b) => a.matchNum - b.matchNum).map((m) => (
            <div key={m.id} style={{
              background: m.status === "running" ? "#1e3a5f" : "#1e293b",
              border: m.status === "running" ? "2px solid #3b82f6" : "1px solid #334155",
              borderRadius: 12, padding: 20,
            }}>
              <div style={{ textAlign: "center", fontSize: 14, color: "#64748b", marginBottom: 10 }}>
                Match {m.matchNum} {m.status === "running" && <span style={{ color: "#22c55e" }}>● LIVE</span>}
              </div>
              <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 5, color: m.winner === m.player1?.uid ? "#fbbf24" : "white" }}>
                    {m.player1?.name}
                  </div>
                  <div style={{ fontSize: 48, fontWeight: 900, color: "#3b82f6" }}>{m.score1 || 0}</div>
                </div>
                <div style={{ fontSize: 20, color: "#475569", fontWeight: 800 }}>VS</div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 5, color: m.winner === m.player2?.uid ? "#fbbf24" : "white" }}>
                    {m.player2?.name}
                  </div>
                  <div style={{ fontSize: 48, fontWeight: 900, color: "#ef4444" }}>{m.score2 || 0}</div>
                </div>
              </div>
              {m.status === "finished" && m.winner && (
                <div style={{ textAlign: "center", marginTop: 10, color: "#fbbf24", fontWeight: 700, fontSize: 18 }}>
                  🏆 {m.winner === m.player1?.uid ? m.player1?.name : m.player2?.name}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Solo round: show leaderboard
  const alive = allPlayers.filter(p => p.status !== "eliminated").sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));
  return (
    <div style={{ background: "#0f172a", color: "white", borderRadius: 12, padding: 30, minHeight: 400 }}>
      <h2 style={{ textAlign: "center", margin: "0 0 5px", fontSize: 28 }}>
        Round {currentRound} — {preset.description}
      </h2>
      <p style={{ textAlign: "center", color: "#94a3b8", margin: "0 0 20px" }}>
        Phase: {(eventData.phase || "idle").toUpperCase()} | Set {eventData.currentSet || 1}/{preset.sets}
      </p>
      <div style={{ maxHeight: 400, overflowY: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #334155" }}>
              <th style={{ ...thStyleDark, width: 50 }}>#</th>
              <th style={thStyleDark}>Player</th>
              <th style={thStyleDark}>Score</th>
            </tr>
          </thead>
          <tbody>
            {alive.slice(0, 20).map((p, i) => (
              <tr key={p.id} style={{ borderBottom: "1px solid #1e293b" }}>
                <td style={tdStyleDark}>{i + 1}</td>
                <td style={tdStyleDark}>{p.name || p.email}</td>
                <td style={{ ...tdStyleDark, fontWeight: 700, fontSize: 18 }}>{p.totalScore || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ label, value, color }) {
  return (
    <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 14px", fontSize: 13 }}>
      <span style={{ color: "#94a3b8" }}>{label}: </span>
      <strong style={{ color: color || "#1e293b" }}>{value}</strong>
    </div>
  );
}

// ── Styles ──
const cardStyle = { border: "1px solid #e2e8f0", padding: 20, borderRadius: 12, marginBottom: 20, background: "white" };
const btnPrimary = { padding: "10px 15px", borderRadius: 6, border: "none", color: "white", cursor: "pointer", fontWeight: "bold" };
const btnSecondary = { padding: "8px 12px", borderRadius: 6, border: "1px solid #ddd", background: "white", cursor: "pointer", fontWeight: "bold" };
const thStyle = { padding: "8px 10px", textAlign: "left", fontSize: 12, color: "#666", borderBottom: "1px solid #eee" };
const tdStyle = { padding: "8px 10px", fontSize: 13 };
const thStyleDark = { padding: "10px 15px", textAlign: "left", fontSize: 13, color: "#94a3b8" };
const tdStyleDark = { padding: "10px 15px", fontSize: 14, color: "#e2e8f0" };
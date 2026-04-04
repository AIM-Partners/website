import React, { useEffect, useState, useRef, useCallback } from "react";
import { auth, db, EVENT_ID, ROUND_PRESETS } from "../math_competition/Firebase";
import { buildQuestion, createSeededRng } from "../math_competition/questionBuilder";
import LoginBox from "../math_competition/LoginBox";
import {
  doc, onSnapshot, collection, query, orderBy, limit,
  updateDoc, increment, serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import hrt from "../icons/partner_icons/hudson_river_trading.svg";
import janestreet from "../icons/partner_icons/jane_street_logo.png";
import wso from "../icons/partner_icons/wso.png";
import poster from "../images/poster.jpg";

const ILLINI_ORANGE = "#FF5F05";
const ILLINI_BLUE = "#13294B";

export default function Competition() {
  const [user, setUser] = useState(null);
  const [playerData, setPlayerData] = useState(null);
  const [event, setEvent] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [playerLoaded, setPlayerLoaded] = useState(false);

  // Game state
  const [q, setQ] = useState(null);
  const [input, setInput] = useState("");
  const [roundCodeInput, setRoundCodeInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [err, setErr] = useState("");

  // PVP state
  const [myMatch, setMyMatch] = useState(null);
  const questionIndexRef = useRef(0);
  const rngRef = useRef(null);
  const inputRef = useRef(null);
  const matchIdRef = useRef(null);

  // Tab detection
  const [tabWarning, setTabWarning] = useState(false);
  const blurTimerRef = useRef(null);
  const lastRecordRef = useRef(0);

  useEffect(() => {
    if (!user) return;

    const recordLeave = () => {
      if (event?.phase !== "running") return;
      // Cooldown: ignore if recorded within last 1 second
      const now = Date.now();
      if (now - lastRecordRef.current < 1000) return;
      lastRecordRef.current = now;

      setTabWarning(true);
      updateDoc(doc(db, "events", EVENT_ID, "players", user.uid), {
        tabLeaveCount: increment(1),
        lastTabLeaveAt: serverTimestamp(),
      }).catch(() => {});
    };

    const handleVisibility = () => {
      if (document.hidden) recordLeave();
    };

    const handleBlur = () => {
      if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
      blurTimerRef.current = setTimeout(() => {
        if (!document.hidden && !document.hasFocus()) {
          recordLeave();
        }
      }, 200);
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", handleBlur);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", handleBlur);
      if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
    };
  }, [user, event?.phase]);

  // ── Auth ──
  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthChecked(true);
    });
  }, []);

  // ── Event doc ──
  useEffect(() => {
    return onSnapshot(doc(db, "events", EVENT_ID), (s) =>
      setEvent(s.exists() ? s.data() : null)
    );
  }, []);

  // ── Player doc ──
  useEffect(() => {
    if (!user) { setPlayerData(null); setPlayerLoaded(true); return; }
    setPlayerLoaded(false);
    return onSnapshot(doc(db, "events", EVENT_ID, "players", user.uid), (s) => {
      setPlayerData(s.exists() ? s.data() : null);
      setPlayerLoaded(true);
    });
  }, [user]);

  // ── PVP: Find my match ──
  useEffect(() => {
    if (!user || !event) { setMyMatch(null); return; }
    const roundNum = event.currentRound;
    const preset = ROUND_PRESETS[roundNum];
    if (!preset || preset.type !== "pvp") { setMyMatch(null); return; }

    return onSnapshot(
      collection(db, "events", EVENT_ID, "rounds", String(roundNum), "matches"),
      (snap) => {
        let found = null;
        snap.forEach((d) => {
          const data = { ...d.data(), id: d.id };
          if (data.player1?.uid === user.uid || data.player2?.uid === user.uid) {
            found = data;
          }
        });

        // Only reinitialize RNG when match changes (different matchId), not on score updates
        if (found && found.questionSeed != null) {
          if (found.id !== matchIdRef.current) {
            rngRef.current = createSeededRng(found.questionSeed);
            questionIndexRef.current = 0;
            matchIdRef.current = found.id;
          }
        } else {
          matchIdRef.current = null;
        }

        setMyMatch(found);
      }
    );
  }, [user, event?.currentRound]);

  // ── Timer ──
  useEffect(() => {
    const roundType = getRoundType(event);
    const isPvpRunning = roundType === "pvp" && myMatch?.status === "running" && myMatch?.endAt;
    const isSoloRunning = event?.phase === "running" && event?.endAt;

    if (isPvpRunning) {
      const interval = setInterval(() => {
        const end = myMatch.endAt.toMillis ? myMatch.endAt.toMillis() : new Date(myMatch.endAt).getTime();
        setTimeLeft(Math.max(0, Math.floor((end - Date.now()) / 1000)));
      }, 250);
      return () => clearInterval(interval);
    } else if (isSoloRunning) {
      const interval = setInterval(() => {
        const end = event.endAt.toMillis ? event.endAt.toMillis() : new Date(event.endAt).getTime();
        setTimeLeft(Math.max(0, Math.floor((end - Date.now()) / 1000)));
      }, 250);
      return () => clearInterval(interval);
    } else {
      setTimeLeft(0);
    }
  }, [event, myMatch]);

  // ── Question generator ──
  const generateNextQuestion = useCallback(() => {
    if (!event) return null;

    // Determine question type: use event field, or fall back to preset, or "basic"
    const roundNum = event.currentRound || 1;
    const preset = ROUND_PRESETS[roundNum];
    const qType = event.questionType || preset?.questionType || "basic";

    // Determine config: use event field, or fall back to preset
    const cfg = event.config || preset?.config || {};

    const roundType = getRoundType(event);
    if (roundType === "pvp" && rngRef.current) {
      return buildQuestion(qType, cfg, rngRef.current);
    }
    return buildQuestion(qType, cfg);
  }, [event]);

  // ── Auto-generate question when conditions are met ──
  useEffect(() => {
    if (!event || !playerData) return;

    const roundType = getRoundType(event);
    const isRunning = event.phase === "running";
    const isReady = playerData.readyForRound === true;

    if (roundType === "pvp") {
      if (myMatch?.status === "running" && !q) {
        setQ(generateNextQuestion());
      }
    } else {
      // Solo: phase=running AND readyForRound AND no current question
      if (isRunning && isReady && !q) {
        setQ(generateNextQuestion());
      }
    }
  }, [event, playerData, myMatch, q, generateNextQuestion]);

  // ── Clear question when phase changes away from running ──
  useEffect(() => {
    if (event && event.phase !== "running") {
      setQ(null);
      setInput("");
    }
  }, [event?.phase]);

  // ── Handlers ──
  const joinRound = async (e) => {
    e.preventDefault();
    if (!playerData) return;
    if (playerData.status === "eliminated") {
      setErr("You have been eliminated.");
      return;
    }
    if (roundCodeInput.trim().toUpperCase() === event.roundCode) {
      await updateDoc(doc(db, "events", EVENT_ID, "players", user.uid), { readyForRound: true });
      setErr("");
    } else {
      setErr("Invalid Round Code");
    }
  };

  const handleInputChange = async (e) => {
    const val = e.target.value;
    setInput(val);
    if (!q || timeLeft <= 0) return;

    const roundType = getRoundType(event);
    const isPvpRunning = roundType === "pvp" && myMatch?.status === "running";
    const isSoloRunning = event?.phase === "running";
    if (!isPvpRunning && !isSoloRunning) return;

    if (Number(val) === q.ans) {
      setInput("");
      questionIndexRef.current += 1;
      setQ(generateNextQuestion());

      await updateDoc(doc(db, "events", EVENT_ID, "players", user.uid), {
        totalScore: increment(1),
        roundScore: increment(1),
        lastScoreAt: serverTimestamp(),
      });

      if (isPvpRunning && myMatch) {
        const isPlayer1 = myMatch.player1?.uid === user.uid;
        const field = isPlayer1 ? "score1" : "score2";
        const roundNum = event.currentRound;
        await updateDoc(
          doc(db, "events", EVENT_ID, "rounds", String(roundNum), "matches", myMatch.id),
          { [field]: increment(1) }
        );
      }

      if (inputRef.current) inputRef.current.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") e.preventDefault();
  };

  // ── Render ──
  if (!authChecked || !event) {
    return <div style={{ padding: "0 120px", marginTop: 120 }}>Loading System...</div>;
  }

  if (!user || (playerLoaded && !playerData)) {
    return (
      <div style={{ padding: "0 20px", marginTop: 100 }}>
        <h2 style={{ textAlign: "center", fontSize: "50px" }}>AIM Partners Mental Math Competition</h2>
        {/* <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "25px", marginBottom: "30px" }}>
          <span style={{ fontSize: "24px", fontWeight: 600 }}>Powered By: </span>
          <img src={hrt} style={{ width: "150px" }} alt="HRT" />
          <img src={janestreet} style={{ width: "150px" }} alt="Jane Street" />
        </div> */}
        {/* <img src={poster} style={{ maxWidth: "500px", height: "auto" }} alt="poster" /> */}
        <LoginBox mode="player" eventId={EVENT_ID} />
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "25px" }}>
          <span style={{ fontSize: "24px", fontWeight: 600 }}>Powered By: </span>
          <img src={hrt} style={{ width: "150px" }} alt="HRT" />
          <img src={janestreet} style={{ width: "150px" }} alt="Jane Street" />
        </div>
        {/* <h3 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: 20, color: "#000" }}>
          Partner With Us and Recruit Top Quantitative Talent
        </h3> */}
        {/* <div className="contact-sponsor">
          <h3 className="contact-sponsor-main">
            Interested in sponsoring us? Reach out at{" "}
            <a className="highlight" href="mailto:corporate-outreach@aim-illinois.com">
              corporate-outreach@aim-illinois.com
            </a>
            !
          </h3>
        </div> */}
      </div>
    );
  }

  if (!playerLoaded) {
    return <div style={{ padding: "0 120px", marginTop: 120 }}>Loading Profile...</div>;
  }

  const currentRound = event.currentRound || 1;
  const preset = ROUND_PRESETS[currentRound] || ROUND_PRESETS[1];
  const roundType = getRoundType(event);
  const isEliminated = playerData.status === "eliminated";
  const isPvpRound = roundType === "pvp";
  const displayName = playerData.name || (user.email ? user.email.split("@")[0] : "Player");

  let canPlay = false;
  if (isPvpRound) {
    canPlay = !isEliminated && myMatch?.status === "running" && timeLeft > 0;
  } else {
    canPlay = !isEliminated && event.phase === "running" && playerData.readyForRound === true && timeLeft > 0;
  }

  const currentSet = event.currentSet || 1;
  const totalSets = preset.sets || 1;
  let phaseDisplay = (event.phase || "idle").toUpperCase();
  if (event.phase === "break") {
    phaseDisplay = "BREAK";
  } else if (event.phase === "running") {
    phaseDisplay = "PLAYING";
  }

  let problemText = "Waiting...";
  if (canPlay && q) {
    problemText = q.text;
  } else if (isEliminated) {
    problemText = "ELIMINATED";
  } else if (event.phase === "ended") {
    problemText = "Round Ended";
  } else if (event.phase === "break") {
    problemText = "Break Time ☕";
  }

  return (
    <div style={{ padding: "0 5%", marginTop: 40, fontFamily: "sans-serif", color: "#333" }}>
      <h1 style={{ textAlign: "center", marginBottom: 5 }}>Mental Math Competition</h1>

      <div style={{ textAlign: "center", marginBottom: 20, display: "flex", justifyContent: "center", gap: 15, flexWrap: "wrap" }}>
        <span style={statusPill}>Round {currentRound}</span>
        <span style={{ ...statusPill, background: isPvpRound ? "#fef2f2" : "#eff6ff", color: isPvpRound ? "#dc2626" : "#2563eb" }}>
          {isPvpRound ? "⚔️ PVP" : "📝 Solo"}
        </span>
        <span style={statusPill}>Set {currentSet}/{totalSets}</span>
        <span style={{
          ...statusPill,
          background: event.phase === "running" ? "#f0fdf4" : event.phase === "break" ? "#fefce8" : "#f1f5f9",
          color: event.phase === "running" ? "#16a34a" : event.phase === "break" ? "#854d0e" : "#475569",
        }}>{phaseDisplay}</span>
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            {isPvpRound ? "⚔️ PVP Match" : "Game Area"}
          </div>
          <div style={{ padding: 20 }}>
            {tabWarning && (
              <div style={{
                background: "#fef2f2", border: "2px solid #ef4444", borderRadius: 8,
                padding: 12, marginBottom: 15, textAlign: "center",
              }}>
                <div style={{ color: "#dc2626", fontWeight: 800, fontSize: 16 }}>
                  ⚠️ Tab switch detected!
                </div>
                <div style={{ color: "#991b1b", fontSize: 13, marginTop: 4 }}>
                  Leaving this tab during competition is recorded.
                </div>
                <button onClick={() => { setTabWarning(false); setTimeout(() => inputRef.current?.focus(), 50); }} style={{
                  marginTop: 8, padding: "4px 16px", borderRadius: 4,
                  border: "1px solid #dc2626", background: "white", color: "#dc2626",
                  cursor: "pointer", fontWeight: 600, fontSize: 12,
                }}>Dismiss</button>
              </div>
            )}
            <div style={{ marginBottom: 15, color: "#555", fontWeight: 600 }}>
              Player: {displayName}
            </div>

            {isEliminated && (
              <div style={alertBoxStyle}>
                You have been eliminated.<br />Final Score: {playerData.totalScore}
              </div>
            )}

            {isPvpRound && myMatch && !isEliminated && (
              <div style={{ background: "#0f172a", color: "white", borderRadius: 10, padding: 20, marginBottom: 15 }}>
                <div style={{ textAlign: "center", fontSize: 14, color: "#94a3b8", marginBottom: 10 }}>
                  Match {myMatch.matchNum} — {myMatch.status === "running" ? "🟢 LIVE" : myMatch.status.toUpperCase()}
                </div>
                <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, color: myMatch.player1?.uid === user.uid ? "#3b82f6" : "white" }}>
                      {myMatch.player1?.name} {myMatch.player1?.uid === user.uid && "(YOU)"}
                    </div>
                    <div style={{ fontSize: 36, fontWeight: 900, color: "#3b82f6" }}>{myMatch.score1 || 0}</div>
                  </div>
                  <div style={{ fontSize: 18, color: "#475569", fontWeight: 800 }}>VS</div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, color: myMatch.player2?.uid === user.uid ? "#ef4444" : "white" }}>
                      {myMatch.player2?.name} {myMatch.player2?.uid === user.uid && "(YOU)"}
                    </div>
                    <div style={{ fontSize: 36, fontWeight: 900, color: "#ef4444" }}>{myMatch.score2 || 0}</div>
                  </div>
                </div>
              </div>
            )}

            {isPvpRound && !myMatch && !isEliminated && (
              <div style={{ ...lobbyBoxStyle, textAlign: "center", color: "#666" }}>
                You are not in a PVP match this round. Waiting for bracket...
              </div>
            )}

            {!isPvpRound && !isEliminated && (event.phase === "lobby" || event.phase === "idle") && !playerData.readyForRound && (
              <div style={lobbyBoxStyle}>
                <div style={{ fontWeight: 900, marginBottom: 10 }}>Enter Round Code</div>
                <form onSubmit={joinRound} style={{ display: "flex", gap: 10 }}>
                  <input value={roundCodeInput} onChange={(e) => setRoundCodeInput(e.target.value)}
                    placeholder="Code from Admin" style={inputStyle} />
                  <button type="submit" style={blackBtnStyle}>Join</button>
                </form>
                {err && <div style={{ color: "crimson", marginTop: 10, fontWeight: "bold" }}>{err}</div>}
              </div>
            )}

            {!isEliminated && (event.phase === "lobby" || event.phase === "idle") && playerData.readyForRound && (
              <div style={{ padding: 20, textAlign: "center", background: "#f0fdf4", borderRadius: 8, color: "#166534", fontWeight: "bold" }}>
                You are ready! Waiting for admin to start...
              </div>
            )}

            {event.phase === "break" && !isEliminated && (
              <div style={{ padding: 20, textAlign: "center", background: "#fefce8", borderRadius: 8, color: "#854d0e", fontWeight: "bold" }}>
                ☕ Break Time — Next set starting soon...
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 15, fontWeight: 800, marginTop: 10 }}>
              <div>Total: {playerData.totalScore} | Round: {playerData.roundScore || 0}</div>
              <div style={{ color: timeLeft < 10 ? "#ef4444" : "#22c55e", fontSize: 20 }}>
                {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
              </div>
            </div>

            <div style={problemBoxStyle}>
              {problemText}
            </div>

            <form style={{ display: "flex", gap: 10 }}>
              <input ref={inputRef} value={input} onChange={handleInputChange} onKeyDown={handleKeyDown}
                placeholder="Answer" disabled={!canPlay} autoFocus style={inputStyle} />
            </form>

            {event.phase === "ended" && (
              <div style={{ marginTop: 15, textAlign: "center", fontWeight: "bold", color: "#2563eb" }}>
                Check the leaderboard for results!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper: get round type from event data, fallback to preset
function getRoundType(event) {
  if (!event) return "solo";
  if (event.roundType) return event.roundType;
  const preset = ROUND_PRESETS[event.currentRound];
  return preset?.type || "solo";
}

// ── Spectator View (standalone page for projector) ──
export function SpectatorView() {
  const [event, setEvent] = useState(null);
  const [allPlayers, setAllPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    return onSnapshot(doc(db, "events", EVENT_ID), (s) => setEvent(s.exists() ? s.data() : null));
  }, []);

  useEffect(() => {
    return onSnapshot(
      query(collection(db, "events", EVENT_ID, "players"), orderBy("totalScore", "desc"), limit(200)),
      (snap) => {
        const rows = [];
        snap.forEach((d) => rows.push({ ...d.data(), id: d.id }));
        setAllPlayers(rows);
      }
    );
  }, []);

  useEffect(() => {
    if (!event?.currentRound) return;
    return onSnapshot(
      collection(db, "events", EVENT_ID, "rounds", String(event.currentRound), "matches"),
      (snap) => {
        const m = [];
        snap.forEach((d) => m.push({ ...d.data(), id: d.id }));
        setMatches(m);
      }
    );
  }, [event?.currentRound]);

  useEffect(() => {
    if (!event?.endAt || event.phase !== "running") { setTimeLeft(0); return; }
    const interval = setInterval(() => {
      const end = event.endAt.toMillis ? event.endAt.toMillis() : new Date(event.endAt).getTime();
      setTimeLeft(Math.max(0, Math.floor((end - Date.now()) / 1000)));
    }, 250);
    return () => clearInterval(interval);
  }, [event]);

  if (!event) return <div style={{ background: "#0f172a", color: "white", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>Loading...</div>;

  const currentRound = event.currentRound || 1;
  const preset = ROUND_PRESETS[currentRound] || ROUND_PRESETS[1];
  const isPvp = preset.type === "pvp";

  return (
    <div style={{ background: "#0f172a", color: "white", minHeight: "100vh", padding: 40, fontFamily: "sans-serif" }}>
      <h1 style={{ textAlign: "center", margin: "0 0 5px", fontSize: 36 }}>
        {currentRound === 5 ? "🏆 GRAND FINAL" : currentRound === 4 ? "⚔️ SEMI-FINAL" : `Round ${currentRound}`}
      </h1>
      <p style={{ textAlign: "center", color: "#94a3b8", margin: "0 0 10px", fontSize: 16 }}>{preset.description}</p>
      <div style={{ textAlign: "center", marginBottom: 30 }}>
        <span style={{ fontSize: 64, fontWeight: 900, color: timeLeft < 10 ? "#ef4444" : timeLeft < 30 ? "#fbbf24" : "#22c55e" }}>
          {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
        </span>
        <div style={{ color: "#64748b", fontSize: 14, marginTop: 5 }}>
          {event.phase === "running" ? `Set ${event.currentSet || 1}/${preset.sets}` : event.phase?.toUpperCase()}
        </div>
      </div>

      {isPvp && matches.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: matches.length <= 2 ? "1fr" : "1fr 1fr", gap: 20, maxWidth: 900, margin: "0 auto" }}>
          {matches.sort((a, b) => a.matchNum - b.matchNum).map((m) => (
            <div key={m.id} style={{
              background: m.status === "running" ? "#1e3a5f" : "#1e293b",
              border: m.status === "running" ? "2px solid #3b82f6" : "1px solid #334155",
              borderRadius: 16, padding: 25,
            }}>
              <div style={{ textAlign: "center", fontSize: 14, color: "#64748b", marginBottom: 12 }}>
                Match {m.matchNum} {m.status === "running" && <span style={{ color: "#22c55e" }}>● LIVE</span>}
              </div>
              <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: m.winner === m.player1?.uid ? "#fbbf24" : "white" }}>{m.player1?.name}</div>
                  <div style={{ fontSize: 56, fontWeight: 900, color: "#3b82f6" }}>{m.score1 || 0}</div>
                </div>
                <div style={{ fontSize: 24, color: "#475569", fontWeight: 800 }}>VS</div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: m.winner === m.player2?.uid ? "#fbbf24" : "white" }}>{m.player2?.name}</div>
                  <div style={{ fontSize: 56, fontWeight: 900, color: "#ef4444" }}>{m.score2 || 0}</div>
                </div>
              </div>
              {m.status === "finished" && m.winner && (
                <div style={{ textAlign: "center", marginTop: 12, color: "#fbbf24", fontWeight: 800, fontSize: 20 }}>
                  🏆 {m.winner === m.player1?.uid ? m.player1?.name : m.player2?.name}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!isPvp && (
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #334155" }}>
                <th style={{ padding: "12px 15px", textAlign: "left", color: "#94a3b8", fontSize: 14 }}>#</th>
                <th style={{ padding: "12px 15px", textAlign: "left", color: "#94a3b8", fontSize: 14 }}>Player</th>
                <th style={{ padding: "12px 15px", textAlign: "right", color: "#94a3b8", fontSize: 14 }}>Score</th>
              </tr>
            </thead>
            <tbody>
              {allPlayers.map((p, i) => {
                const isElim = p.status === "eliminated";
                return (
                  <tr key={p.id} style={{
                    borderBottom: "1px solid #1e293b",
                    background: isElim ? "transparent" : i < 3 ? "rgba(59,130,246,0.08)" : "transparent",
                    opacity: isElim ? 0.4 : 1,
                  }}>
                    <td style={{ padding: "14px 15px", fontSize: !isElim && i < 3 ? 22 : 16, fontWeight: !isElim && i < 3 ? 900 : 400, color: isElim ? "#ef4444" : "inherit" }}>
                      {isElim ? "—" : i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                    </td>
                    <td style={{ padding: "14px 15px", fontSize: !isElim && i < 3 ? 20 : 16, fontWeight: !isElim && i < 3 ? 700 : 400, color: isElim ? "#ef4444" : "inherit", textDecoration: isElim ? "line-through" : "none" }}>
                      {p.name || p.email}
                    </td>
                    <td style={{ padding: "14px 15px", fontSize: !isElim && i < 3 ? 24 : 16, fontWeight: 900, textAlign: "right", color: isElim ? "#ef4444" : "#3b82f6" }}>
                      {p.totalScore || 0}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Styles ──
const statusPill = {
  background: "#f1f5f9", padding: "6px 14px", borderRadius: 20,
  fontSize: 13, fontWeight: 600, color: "#475569",
};
const cardStyle = {
  border: "1px solid #ddd", borderRadius: 12, background: "white",
  overflow: "hidden", boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
};
const cardHeaderStyle = {
  padding: 16, borderBottom: "1px solid #eee", fontWeight: 900,
  background: "#fafafa", fontSize: "1.1rem",
};
const inputStyle = {
  flex: 1, padding: 12, borderRadius: 8, border: "1px solid #ccc",
  fontSize: "24px", outline: "none", textAlign: "center", fontWeight: "bold",
};
const blackBtnStyle = {
  padding: "10px 20px", borderRadius: 8, border: "1px solid #111",
  background: "#111", color: "white", fontWeight: 800, cursor: "pointer", fontSize: "16px",
};
const problemBoxStyle = {
  border: "1px solid #eee", borderRadius: 12, padding: 30,
  textAlign: "center", fontSize: 40, fontWeight: 900, background: "#fff",
  marginBottom: 20, boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)",
};
const alertBoxStyle = {
  background: "#fef2f2", color: "#991b1b", padding: 15,
  borderRadius: 8, fontWeight: "bold", marginBottom: 15, textAlign: "center",
};
const lobbyBoxStyle = {
  border: "1px solid #ddd", borderRadius: 12, padding: 15,
  marginBottom: 15, background: "#fafafa",
};
const thStyle = { padding: "12px 15px", textAlign: "left", fontSize: "14px", color: "#666" };
const tdStyle = { padding: "12px 15px", fontSize: "15px" };
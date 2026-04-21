import React, { useMemo, useState, useEffect } from "react";
import { auth, db, EVENT_ID } from "./Firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp, getDoc, onSnapshot } from "firebase/firestore";

const ILLINI_ORANGE = "#FF5F05";
const ILLINI_BLUE = "#13294B";
const GRAY_BORDER = "#e0e0e0";

function nameFromEmail(email) {
  if (!email) return "";
  const at = email.indexOf("@");
  return at === -1 ? email : email.slice(0, at);
}

export default function LoginBox({ mode, onDone }) {
  const isAdmin = mode === "admin";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [eventData, setEventData] = useState(null);

  const joinCodeFromEnv = useMemo(() => process.env.REACT_APP_JOIN_CODE || "AIM2026", []);

  useEffect(() => {
    if (isAdmin) return;
    return onSnapshot(doc(db, "events", EVENT_ID), (snap) => setEventData(snap.data()));
  }, [isAdmin]);

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    setBusy(true);

    const emailClean = email.trim().toLowerCase();

    try {
      if (!isAdmin) {
        if (!emailClean.endsWith("@illinois.edu")) throw new Error("Only @illinois.edu emails allowed.");
        
        if (isSignUp) {
            if (eventData && eventData.registrationOpen === false) {
                throw new Error("Registration is currently CLOSED by Admin.");
            }
            if (joinCode !== joinCodeFromEnv) throw new Error("Invalid Join Code.");
        }
      }

      let cred;
      if (isSignUp) {
        cred = await createUserWithEmailAndPassword(auth, emailClean, password);
      } else {
        cred = await signInWithEmailAndPassword(auth, emailClean, password);
      }
      
      const uid = cred.user.uid;

      if (isAdmin) {
        const adminDoc = await getDoc(doc(db, "events", EVENT_ID, "admins", uid));
        if (!adminDoc.exists()) throw new Error("Not an admin.");
      } else {
        const playerRef = doc(db, "events", EVENT_ID, "players", uid);
        
        const playerName = nameFromEmail(emailClean);
        const payload = {
            uid,
            email: emailClean,
            name: playerName,
            lastLoginAt: serverTimestamp(),
        };

        if (isSignUp) {
            payload.totalScore = 0;
            payload.status = "alive";
            payload.createdAt = serverTimestamp();
        }

        await setDoc(playerRef, payload, { merge: true });
      }

      if (onDone) onDone();
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setBusy(false);
    }
  }

  // Styles
  const cardStyle = {
    maxWidth: 420,
    margin: "60px auto",
    padding: "30px 40px",
    borderRadius: "8px",
    background: "#fff",
    border: `1px solid ${GRAY_BORDER}`,
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    textAlign: "center",
  };

  const inputStyle = {
    width: "100%", padding: "12px", borderRadius: "6px",
    border: `1px solid ${GRAY_BORDER}`, background: "#fff", color: "#333",
    outline: "none", fontSize: "16px", marginBottom: "15px", boxSizing: "border-box"
  };

  const btnStyle = {
    width: "100%", padding: "12px", borderRadius: "6px", border: "none",
    background: ILLINI_ORANGE, color: "#fff", fontWeight: "bold",
    cursor: busy ? "not-allowed" : "pointer", fontSize: "16px", marginTop: "10px"
  };

  return (
    <div style={cardStyle}>
      <h2 style={{ textAlign: "center", color: ILLINI_BLUE, marginTop: 0, marginBottom: "30px", fontSize: "28px" }}>
        {isAdmin ? "Admin Console" : (isSignUp ? "Join Competition" : "Participant Login")}
      </h2>
      
      <form onSubmit={handleSubmit}>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={isAdmin ? "Admin Email" : "netid@illinois.edu"} style={inputStyle} required />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" style={inputStyle} required />
        
        {!isAdmin && isSignUp && (
            <input value={joinCode} onChange={e => setJoinCode(e.target.value)} placeholder="Join Code (Ask Officers)" style={inputStyle} required />
        )}
        
        <button disabled={busy} style={btnStyle}>{busy ? "Processing..." : (isSignUp ? "Sign Up" : "Login")}</button>
      </form>

      {!isAdmin && (
        <div style={{color: "#707372", fontSize: "14px", textDecoration: "underline", cursor: "pointer", marginTop: "20px"}} onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? "Already have an account? Login" : "First time? Create an account"}
        </div>
      )}

      {err && <div style={{ color: "#d32f2f", textAlign: "center", marginTop: "20px", fontSize: "14px", fontWeight: "bold" }}>{err}</div>}
      
      {!isAdmin && eventData && !eventData.registrationOpen && !isSignUp && (
          <div style={{textAlign: "center", marginTop: "15px", color: "#d32f2f", fontWeight: "bold", fontSize: "14px"}}>* Registration CLOSED *</div>
      )}
    </div>
  );
}
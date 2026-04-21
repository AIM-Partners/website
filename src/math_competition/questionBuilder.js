/**
 * Shared question generation logic for the math competition.
 * Supports: basic (+,-,×,÷), compound3 (X×Y+Z), compound4 (X×Y+Z×A)
 *
 * For PVP: uses a seeded PRNG so both players get the same sequence.
 */

function randInt(min, max, rng) {
  const r = rng ? rng() : Math.random();
  return Math.floor(r * (max - min + 1)) + min;
}

// Simple seeded PRNG (mulberry32)
export function createSeededRng(seed) {
  let t = seed >>> 0;
  return function () {
    t = (t + 0x6d2b79f5) | 0;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

// Hash a string to a 32-bit number (for seed)
export function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    hash = ((hash << 5) - hash + ch) | 0;
  }
  return hash >>> 0;
}

/**
 * Build a single question.
 * @param {string} questionType - "basic" | "compound3" | "compound4"
 * @param {object} cfg - number range config
 * @param {function} [rng] - optional seeded RNG for PVP
 */
export function buildQuestion(questionType, cfg, rng) {
  if (questionType === "compound4") return buildCompound4(cfg, rng);
  if (questionType === "compound3") return buildCompound3(cfg, rng);
  return buildBasic(cfg, rng);
}

function buildBasic(cfg, rng) {
  const ops = cfg?.ops || { add: true, sub: true, mul: true, div: true };
  const enabled = Object.keys(ops).filter((op) => ops[op]);
  const pick = enabled.length ? enabled[randInt(0, enabled.length - 1, rng)] : "add";

  const addMin = cfg?.addMin ?? 2;
  const addMax = cfg?.addMax ?? 100;
  const mulAmin = cfg?.mulAmin ?? 2;
  const mulAmax = cfg?.mulAmax ?? 12;
  const mulBmin = cfg?.mulBmin ?? 2;
  const mulBmax = cfg?.mulBmax ?? 100;

  if (pick === "add") {
    const a = randInt(addMin, addMax, rng);
    const b = randInt(addMin, addMax, rng);
    return { text: `${a} + ${b}`, ans: a + b };
  }
  if (pick === "sub") {
    const a = randInt(addMin, addMax, rng);
    const b = randInt(addMin, addMax, rng);
    return { text: `${Math.max(a, b)} − ${Math.min(a, b)}`, ans: Math.abs(a - b) };
  }
  if (pick === "mul") {
    const a = randInt(mulAmin, mulAmax, rng);
    const b = randInt(mulBmin, mulBmax, rng);
    return { text: `${a} × ${b}`, ans: a * b };
  }
  // div
  const a = randInt(mulAmin, mulAmax, rng);
  const b = randInt(mulBmin, mulBmax, rng);
  const prod = a * b;
  return { text: `${prod} ÷ ${a}`, ans: b };
}

// X × Y + Z  or  X × Y − Z  (randomly picks + or −, ensures non-negative)
function buildCompound3(cfg, rng) {
  const mulAmin = cfg?.mulAmin ?? 2;
  const mulAmax = cfg?.mulAmax ?? 39;
  const mulBmin = cfg?.mulBmin ?? 2;
  const mulBmax = cfg?.mulBmax ?? 100;
  const addMin = cfg?.addMin ?? 2;
  const addMax = cfg?.addMax ?? 100;

  const x = randInt(mulAmin, mulAmax, rng);
  const y = randInt(mulBmin, mulBmax, rng);
  const z = randInt(addMin, addMax, rng);
  const product = x * y;

  // randomly + or -
  const useAdd = randInt(0, 1, rng) === 0;
  if (useAdd) {
    return { text: `${x} × ${y} + ${z}`, ans: product + z };
  } else {
    // ensure non-negative: if product < z, swap to addition
    if (product < z) {
      return { text: `${x} × ${y} + ${z}`, ans: product + z };
    }
    return { text: `${x} × ${y} − ${z}`, ans: product - z };
  }
}

// X × Y + Z × A  or  X × Y − Z × A
function buildCompound4(cfg, rng) {
  const mulAmin = cfg?.mulAmin ?? 2;
  const mulAmax = cfg?.mulAmax ?? 39;
  const mulBmin = cfg?.mulBmin ?? 2;
  const mulBmax = cfg?.mulBmax ?? 100;
  const addMin = cfg?.addMin ?? 2;
  const addMax = cfg?.addMax ?? 100;

  const x = randInt(mulAmin, mulAmax, rng);
  const y = randInt(mulBmin, mulBmax, rng);
  const z = randInt(addMin, addMax, rng);
  const a = randInt(mulAmin, mulAmax, rng);

  const prod1 = x * y;
  const prod2 = z * a;

  const useAdd = randInt(0, 1, rng) === 0;
  if (useAdd) {
    return { text: `${x} × ${y} + ${z} × ${a}`, ans: prod1 + prod2 };
  } else {
    if (prod1 < prod2) {
      return { text: `${x} × ${y} + ${z} × ${a}`, ans: prod1 + prod2 };
    }
    return { text: `${x} × ${y} − ${z} × ${a}`, ans: prod1 - prod2 };
  }
}

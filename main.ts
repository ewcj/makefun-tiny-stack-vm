import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const I = process.env.MAKEFUN_INPUT_DIR ?? '/input', O = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const T = {};
const d = (b, i, p, q) => T[b] = [i, p, q];
for (const b of [16,17,18,19,20,21,22,24,25,26,28,29,30,32,33,34]) d(b, 0, 2, 1);
d(0,0,0,0); d(1,1,0,1); d(2,4,0,1); d(3,0,1,0); d(4,0,1,2); d(5,0,2,2); d(6,0,2,3); d(7,0,3,3);
d(23,0,1,1); d(27,0,1,1);
d(48,2,0,0); d(49,2,1,0); d(50,2,1,0); d(51,2,0,0); d(52,0,0,0);
d(64,0,1,1); d(65,0,2,0);
d(80,0,1,0); d(81,0,1,0); d(82,0,0,1); d(83,0,1,0);
function run(P, A) {
  const n = P.length, S = new Int32Array(256), C = new Int32Array(64), M = new Int32Array(256), U = new Uint8Array(65536);
  let sp = 0, cp = 0, ol = 0, ip = 0, pc = 0, st = 0;
  const end = e => [U.slice(0, ol), e];
  for (;;) {
    if (st === 1e6) return end(10);
    if (pc < 0 || pc >= n) return end(9);
    const o = P[pc], m = T[o];
    if (!m) return end(5);
    if (pc + m[0] >= n) return end(9);
    st++;
    const nx = pc + 1 + m[0];
    if (sp < m[1]) return end(2);
    if (sp - m[1] + m[2] > 256) return end(3);
    pc = nx;
    switch (o) {
      case 0: return end(0);
      case 1: S[sp++] = P[nx - 1] << 24 >> 24; break;
      case 2: S[sp++] = P[nx - 4] | P[nx - 3] << 8 | P[nx - 2] << 16 | P[nx - 1] << 24; break;
      case 3: sp--; break;
      case 4: S[sp] = S[sp - 1]; sp++; break;
      case 5: { const t = S[sp - 1]; S[sp - 1] = S[sp - 2]; S[sp - 2] = t; break; }
      case 6: S[sp] = S[sp - 2]; sp++; break;
      case 7: { const a = S[sp - 3]; S[sp - 3] = S[sp - 2]; S[sp - 2] = S[sp - 1]; S[sp - 1] = a; break; }
      case 23: S[sp - 1] = -S[sp - 1] | 0; break;
      case 27: S[sp - 1] = ~S[sp - 1]; break;
      case 16: case 17: case 18: case 19: case 20: case 21: case 22:
      case 24: case 25: case 26: case 28: case 29: case 30:
      case 32: case 33: case 34: {
        const b = S[sp - 1], a = S[sp - 2];
        let r;
        if (o === 16) r = a + b | 0;
        else if (o === 17) r = a - b | 0;
        else if (o === 18) r = Math.imul(a, b);
        else if (o === 19) { if (!b) return end(4); r = a === -2147483648 && b === -1 ? a : a / b | 0; }
        else if (o === 20) { if (!b) return end(4); r = b === -1 ? 0 : a % b | 0; }
        else if (o === 21) { if (!b) return end(4); r = Math.floor((a >>> 0) / (b >>> 0)) | 0; }
        else if (o === 22) { if (!b) return end(4); r = (a >>> 0) % (b >>> 0) | 0; }
        else if (o === 24) r = a & b;
        else if (o === 25) r = a | b;
        else if (o === 26) r = a ^ b;
        else if (o === 28) r = a << (b & 31);
        else if (o === 29) r = a >> (b & 31);
        else if (o === 30) r = a >>> (b & 31) | 0;
        else if (o === 32) r = a === b ? 1 : 0;
        else if (o === 33) r = a < b ? 1 : 0;
        else r = (a >>> 0) < (b >>> 0) ? 1 : 0;
        sp -= 2; S[sp++] = r;
        break;
      }
      case 48: case 49: case 50: {
        const rel = (P[nx - 2] | P[nx - 1] << 8) << 16 >> 16;
        let t = 1;
        if (o !== 48) { const v = S[--sp]; t = o === 49 ? v === 0 : v !== 0; }
        if (t) pc = nx + rel;
        break;
      }
      case 51:
        if (cp === 64) return end(7);
        C[cp++] = nx; pc = P[nx - 2] | P[nx - 1] << 8;
        break;
      case 52:
        if (!cp) return end(8);
        pc = C[--cp];
        break;
      case 64: {
        const a = S[sp - 1];
        if (a < 0 || a > 255) return end(6);
        S[sp - 1] = M[a];
        break;
      }
      case 65: {
        const a = S[sp - 1], v = S[sp - 2];
        if (a < 0 || a > 255) return end(6);
        sp -= 2; M[a] = v;
        break;
      }
      case 80: {
        const s = String(S[sp - 1]);
        if (ol + s.length > 65536) return end(11);
        sp--;
        for (let i = 0; i < s.length; i++) U[ol++] = s.charCodeAt(i);
        break;
      }
      case 81:
        if (ol + 1 > 65536) return end(11);
        U[ol++] = S[--sp] & 255;
        break;
      case 82: S[sp++] = ip < A.length ? A[ip++] : -1; break;
      case 83: return end(S[--sp] & 255);
    }
  }
}
for (const id of readdirSync(I).sort()) {
  const [o, e] = run(readFileSync(join(I, id, 'program.bin')), readFileSync(join(I, id, 'input.bin')));
  mkdirSync(join(O, id), { recursive: true });
  writeFileSync(join(O, id, 'stdout.bin'), o);
  writeFileSync(join(O, id, 'exit.txt'), e + '\n');
}

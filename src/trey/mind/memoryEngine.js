const STM = {};
const MTC = {};
const LTK = {};

export function setMemory(scope, key, value) {
  if (scope === "stm") STM[key] = value;
  if (scope === "mtc") MTC[key] = value;
  if (scope === "ltk") LTK[key] = value;
}

export function getMemory(scope, key) {
  if (scope === "stm") return STM[key];
  if (scope === "mtc") return MTC[key];
  if (scope === "ltk") return LTK[key];
  return null;
}

export function clearMemory() {
  for (const k of Object.keys(STM)) delete STM[k];
  for (const k of Object.keys(MTC)) delete MTC[k];
}

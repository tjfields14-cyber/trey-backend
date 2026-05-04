import React from 'react';

export default function ExecutiveHUD({ runtime }) {
  return (
    <div className="rounded-2xl p-6 shadow-lg border bg-black text-green-400">
      <h1 className="text-2xl font-bold mb-4">
        Pearl.Ai Executive HUD
      </h1>

      <div className="space-y-2">
        <p>Heartbeat: {runtime.heartbeat}</p>
        <p>Narrative Pulse: {runtime.narrativePulse}</p>
        <p>Reflection Depth: {runtime.reflectionDepth}</p>
      </div>
    </div>
  );
}
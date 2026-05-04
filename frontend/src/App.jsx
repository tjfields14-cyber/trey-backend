import React, { useEffect, useState } from 'react';
import ExecutiveHUD from './components/ExecutiveHUD';
import { StateManager } from './state/StateManager';

const manager = new StateManager();

export default function App() {
  const [runtime, setRuntime] = useState(manager.getState());

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:4000');

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type && data.value !== undefined) {
        manager.update(data.type, data.value);
        setRuntime({ ...manager.getState() });
      }
    };

    return () => socket.close();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 p-8">
      <ExecutiveHUD runtime={runtime} />
    </div>
  );
}
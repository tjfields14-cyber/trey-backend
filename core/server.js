const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');

const app = express();
app.use(cors());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const runtimeState = {
  heartbeat: 0,
  narrativePulse: 0,
  reflectionDepth: 0
};

app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    runtime: runtimeState
  });
});

wss.on('connection', (ws) => {
  ws.send(JSON.stringify({
    type: 'runtime-connected',
    runtimeState
  }));
});

function broadcast(event) {
  const payload = JSON.stringify(event);

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

setInterval(() => {
  runtimeState.heartbeat++;
  broadcast({
    type: 'heartbeat',
    value: runtimeState.heartbeat
  });
}, 2000);

setInterval(() => {
  runtimeState.narrativePulse++;
  broadcast({
    type: 'narrative-pulse',
    value: runtimeState.narrativePulse
  });
}, 5000);

setInterval(() => {
  runtimeState.reflectionDepth++;
  broadcast({
    type: 'reflection-loop',
    value: runtimeState.reflectionDepth
  });
}, 7000);

server.listen(4000, () => {
  console.log('Pearl.Ai runtime active on port 4000');
});
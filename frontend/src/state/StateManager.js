export class StateManager {
  constructor() {
    this.runtime = {
      heartbeat: 0,
      narrativePulse: 0,
      reflectionDepth: 0
    };
  }

  update(type, value) {
    if (type === 'heartbeat') {
      this.runtime.heartbeat = value;
    }

    if (type === 'narrative-pulse') {
      this.runtime.narrativePulse = value;
    }

    if (type === 'reflection-loop') {
      this.runtime.reflectionDepth = value;
    }
  }

  getState() {
    return this.runtime;
  }
}
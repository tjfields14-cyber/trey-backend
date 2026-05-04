/**
 * Trey Brain Widget
 *
 * A simple JavaScript widget for interacting with the Trey AI brain via the backend API.
 * This widget provides a basic interface to ask questions and display responses.
 */

export class TreyBrainWidget {
  constructor(containerId, apiBaseUrl = 'http://localhost:3000') {
    this.container = document.getElementById(containerId);
    this.apiBaseUrl = apiBaseUrl;
    this.init();
  }

  init() {
    this.container.innerHTML = `
      <div id="trey-widget">
        <h3>Trey Brain Assistant</h3>
        <div id="trey-chat"></div>
        <input type="text" id="trey-input" placeholder="Ask Trey a question..." />
        <button id="trey-submit">Ask</button>
        <div id="trey-status"></div>
      </div>
    `;

    this.chatDiv = document.getElementById('trey-chat');
    this.input = document.getElementById('trey-input');
    this.submitBtn = document.getElementById('trey-submit');
    this.statusDiv = document.getElementById('trey-status');

    this.submitBtn.addEventListener('click', () => this.askTrey());
    this.input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.askTrey();
    });
  }

  async askTrey() {
    const question = this.input.value.trim();
    if (!question) return;

    this.statusDiv.textContent = 'Thinking...';
    this.input.disabled = true;
    this.submitBtn.disabled = true;

    try {
      const response = await fetch(`${this.apiBaseUrl}/kb/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      this.displayMessage('You', question);
      this.displayMessage('Trey', data.answer || 'No response');
    } catch (error) {
      this.displayMessage('Error', `Failed to get response: ${error.message}`);
    } finally {
      this.statusDiv.textContent = '';
      this.input.disabled = false;
      this.submitBtn.disabled = false;
      this.input.value = '';
      this.input.focus();
    }
  }

  displayMessage(sender, message) {
    const messageDiv = document.createElement('div');
    messageDiv.innerHTML = `<strong>${sender}:</strong> ${message}`;
    this.chatDiv.appendChild(messageDiv);
    this.chatDiv.scrollTop = this.chatDiv.scrollHeight;
  }
}

// Usage example:
// const widget = new TreyBrainWidget('widget-container');

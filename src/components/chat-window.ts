import { BaseComponent } from './base-component';
import { marked } from 'marked';

// Configure marked for basic parsing
marked.setOptions({});
import { StorageService, ChatMessage } from '../services/storage';
import { WebhookService } from '../services/webhook';

export class ChatWindow extends BaseComponent {
  static get observedAttributes() {
    return ['webhook-url', 'title', 'welcome-message', 'history-enabled', 'history-clear-button', 'position'];
  }

  private styles = `
    .chat-window {
      position: fixed;
      bottom: 80px;
      right: 0;
      width: 100%;
      max-width: 420px;
      height: calc(100vh - 100px);
      max-height: 600px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      opacity: 0;
      transform: translateY(20px);
      transition: opacity 0.2s ease, transform 0.2s ease;
      pointer-events: none;
    }
    .suggestion-button {
          background: #fff;
          border: 1px solid #e5e5e5;
          border-radius: 20px;
          padding: 10px 16px;
          font-size: 15px;
          font-weight: 500;
          margin-bottom: 10px;
          cursor: pointer;
          text-align: left;
          transition: background-color 0.2s;
        }

        .suggestion-button:hover {
          background-color: #f0f0f0;
        }

        .suggestion-button::after {
          content: '➤';
          float: right;
          opacity: 0.5;
        }

    @media (max-width: 480px) {
      .chat-window {
        position: fixed;
        inset: 0;
        width: 100%;
        height: 100dvh;
        max-height: none;
        border-radius: 0;
        transform: translateY(100%);
        contain: layout style;
        touch-action: manipulation;
        overscroll-behavior: none;
      }
      
      .chat-window.open {
        transform: translateY(0);
      }

      .messages {
        padding: 12px;
        padding-bottom: 80px;
      }

      .input-area {
        padding: 12px;
        padding-bottom: calc(env(safe-area-inset-bottom) + 16px);
        position: sticky;
        bottom: 0;
        z-index: 10;
        background-color: inherit;
      }

    }

    .chat-window.open {
      opacity: 1;
      transform: translateY(0);
      pointer-events: all;
    }

    :host([position="bottom-left"]) .chat-window {
      right: auto;
      left: 0;
    }

    .header {
      padding: 16px;
      background-color: var(--theme-color, #1E40AF);
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header h2 {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    .header button {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      opacity: 0.9;
      transition: opacity 0.2s;
      border-radius: 8px;
      background-color: rgba(255, 255, 255, 0.1);
    }

    .header button:hover {
      opacity: 1;
    }

    .messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      background-color: #f7f7f8;
    }

    .message {
      max-width: 85%;
      padding: 12px 16px;
      border-radius: 16px;
      font-size: 16px;
      line-height: 1.5;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }

    .message.user {
      align-self: flex-end;
      background-color: var(--theme-color, #1E40AF);
      color: white;
      border-bottom-right-radius: 4px;
    }

    .message.bot {
      background-color: #f0f0f0;
      align-self: flex-start;
      border-bottom-left-radius: 0;
    }

    /* Add dark mode support for chat window */
    :host([data-theme="dark"]) .chat-window,
    [data-theme="dark"] .chat-window {
      background: #18181b;
      color: #f3f4f6;
    }
    :host([data-theme="dark"]) .messages,
    [data-theme="dark"] .messages {
      background-color: #18181b;
    }
    :host([data-theme="dark"]) .message.bot,
    [data-theme="dark"] .message.bot {
      background-color: #23232a;
      color: #f3f4f6;
    }
    :host([data-theme="dark"]) .message.user,
    [data-theme="dark"] .message.user {
      background-color: #2563eb;
      color: #fff;
    }
    :host([data-theme="dark"]) .input-area,
    [data-theme="dark"] .input-area {
      background-color: #23232a;
      border-top: 1px solid #333843;
    }
    :host([data-theme="dark"]) .input-area input,
    [data-theme="dark"] .input-area input {
      background-color: #18181b;
      color: #f3f4f6;
      border: 1px solid #333843;
    }
    :host([data-theme="dark"]) .input-area button,
    [data-theme="dark"] .input-area button {
      background-color: #2563eb;
      color: #fff;
    }
    :host([data-theme="dark"]) .suggestion-button,
    [data-theme="dark"] .suggestion-button {
      background: #23232a;
      color: #f3f4f6;
      border-color: #333843;
    }
    :host([data-theme="dark"]) .suggestion-button:hover,
    [data-theme="dark"] .suggestion-button:hover {
      background: #18181b;
    }
    :host([data-theme="dark"]) .message-status,
    [data-theme="dark"] .message-status {
      color: #cbd5e1;
    }
    :host([data-theme="dark"]) .cancel-button,
    [data-theme="dark"] .cancel-button {
      background: rgba(255,255,255,0.08);
      color: #fff;
    }
    :host([data-theme="dark"]) .message.system,
    [data-theme="dark"] .message.system {
      background-color: #23232a;
      color: #a1a1aa;
    }
    :host([data-theme="dark"]) .message.bot code,
    [data-theme="dark"] .message.bot code {
      background-color: #27272a;
      color: #facc15;
    }
    :host([data-theme="dark"]) .message.bot pre,
    [data-theme="dark"] .message.bot pre {
      background-color: #23232a;
      color: #f3f4f6;
    }
    :host([data-theme="dark"]) .message.bot a,
    [data-theme="dark"] .message.bot a {
      color: #60a5fa;
    }
    .message.bot h1,
    .message.bot h2,
    .message.bot h3,
    .message.bot h4,
    .message.bot h5,
    .message.bot h6 {
      margin: 8px 0;
      line-height: 1.2;
      font-size: 1em;
    }

    .message.bot h1 { font-size: 1.4em; }
    .message.bot h2 { font-size: 1.3em; }
    .message.bot h3 { font-size: 1.2em; }

    .message.bot p {
      margin: 8px 0;
    }

    .message.bot ul,
    .message.bot ol {
      margin: 8px 0;
      padding-left: 20px;
    }

    .message.bot code {
      background-color: #e8e8e8;
      padding: 2px 4px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 0.9em;
    }

    .message.bot pre {
      background-color: #e8e8e8;
      padding: 8px;
      border-radius: 4px;
      overflow-x: auto;
      margin: 8px 0;
    }

    .message.bot pre code {
      background-color: transparent;
      padding: 0;
      border-radius: 0;
    }

    .message.bot a {
      color: var(--theme-color, #1E40AF);
      text-decoration: none;
    }

    .message.bot a:hover {
      text-decoration: underline;
    }

    .message.bot blockquote {
      border-left: 4px solid #ddd;
      margin: 8px 0;
      padding-left: 16px;
      color: #666;
    }

    .message.bot table {
      border-collapse: collapse;
      margin: 8px 0;
      width: 100%;
      font-size: 0.9em;
    }

    .message.bot th,
    .message.bot td {
      border: 1px solid #ddd;
      padding: 6px;
    }

    .message.bot th {
      background-color: #e8e8e8;
      font-weight: 600;
    }

    .message.bot img {
      max-width: 100%;
      height: auto;
      border-radius: 4px;
      margin: 8px 0;
    }

    .message.system {
      align-self: center;
      background-color: #f5f5f5;
      color: #666;
      font-style: italic;
      font-size: 13px;
    }

    .message.error {
      background-color: #fee2e2;
      color: #991b1b;
    }

    .message-status {
      font-size: 11px;
      margin-top: 4px;
      opacity: 0.8;
    }

    .cancel-button {
      font-size: 12px;
      padding: 2px 6px;
      color:rgb(255, 255, 255);
      background: rgba(0, 0, 0, 0.1);
      border: none;
      border-radius: 4px;
      cursor: pointer;
      margin-left: 8px;
    }

    .input-area {
      padding: 16px;
      background-color: white;
      border-top: 1px solid #eee;
      display: flex;
      gap: 8px;
      position: relative;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
    }

    .input-area input {
      flex: 1;
      padding: 12px 16px;
      border: 1px solid #e5e5e5;
      border-radius: 24px;
      font-size: 16px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .input-area input:focus {
      outline: none;
      border-color: var(--theme-color, #1E40AF);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .input-area button {
      background-color: var(--theme-color, #1E40AF);
      color: white;
      border: none;
      border-radius: 20px;
      padding: 8px 16px;
      cursor: pointer;
      font-size: 14px;
      transition: opacity 0.2s;
    }

    .input-area button:hover {
      opacity: 0.9;
    }

    .input-area button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    @media (prefers-color-scheme: dark) {
      .chat-window {
        background: #18181b;
        color: #f3f4f6;
      }

      .messages {
        background-color: #18181b;
      }

      .message.bot {
        background-color: #23232a;
        color: #f3f4f6;
      }

      .message.user {
        background-color: var(--theme-color, #4f8cff);
        color: white;
      }

      .input-area {
        background-color: #1f1f1f;
        border-top: 1px solid #333;
      }

      .input-area input {
        background-color: #2c2c2c;
        color: #eee;
        border: 1px solid #444;
      }

      .link-preview {
        background-color: #2c2c2c !important;
        border-color: #444 !important;
        color: #eee !important;
      }

      .message.bot a {
        color: #91bfff;
      }
    }
  `;

  private isOpen = false;
  private storage: StorageService;
  private webhook: WebhookService;
  private sessionId: string;
  private hasShownWelcomeMessage = false;

  constructor() {
    super();
    const webhookUrl = this.getAttribute('webhook-url') || '';
    this.storage = new StorageService(webhookUrl);
    this.webhook = new WebhookService(webhookUrl);
    this.sessionId = crypto.randomUUID();
    this.addStyles(this.styles);
  }

  connectedCallback() {
    // --- Dark mode sync ---
    const syncTheme = () => {
      const theme = document.documentElement.getAttribute('data-theme');
      if (theme === 'dark') {
        this.setAttribute('data-theme', 'dark');
      } else {
        this.removeAttribute('data-theme');
      }
    };
    syncTheme();
    const observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    (this as any)._themeObserver = observer;
    // --- End dark mode sync ---

    this.render();
  }

  protected render(): void {
    const window = this.createElement('div', 'chat-window');
    
    // Header
    const header = this.createElement('div', 'header');
    const title = this.createElement('h2', '', this.getAttribute('title') || 'Chat with us');
    const headerActions = this.createElement('div', 'header-actions');
    
    if (this.getAttribute('history-enabled') !== 'false' && 
        this.getAttribute('history-clear-button') !== 'false') {
      const clearBtn = this.createElement('button', '', '⌫');
      clearBtn.title = 'Clear history';
      clearBtn.addEventListener('click', () => this.clearHistory());
      headerActions.appendChild(clearBtn);
    }
    
    const closeBtn = this.createElement('button', '', '✕');
    closeBtn.addEventListener('click', () => this.close());
    headerActions.appendChild(closeBtn);
    
    header.appendChild(title);
    header.appendChild(headerActions);
    
    // Messages area
    const messages = this.createElement('div', 'messages');
    
    // Load existing messages
    if (this.getAttribute('history-enabled') !== 'false') {
      const existingMessages = this.storage.getMessages();
      existingMessages.forEach(msg => this.renderMessage(msg, messages));
    }

    const suggestions = [
      'Triển khai smarthome thế nào?',
      'Tìm hiểu về lắp đặt điện mặt trời',
      'Triển khai các dịch vụ xem phim, giải trí tại nhà thì cần những gì?',
      'Làm thế nào để wifi trong nhà mạnh hơn?'
    ];
    suggestions.forEach(text => {
      const button = this.createElement('button', 'suggestion-button', text);
      button.addEventListener('click', () => {
        this.sendMessage(text);
      });
      messages.appendChild(button);
    });
    
    // Input area
    const inputArea = this.createElement('div', 'input-area');
    const input = this.createElement('input') as HTMLInputElement;
    input.type = 'text';
    input.placeholder = 'Type your message...';
    
    const sendBtn = this.createElement('button', '', 'Send');
    const handleSend = () => {
      const text = input.value.trim();
      if (text) {
        this.sendMessage(text);
        input.value = '';
      }
    };
    
    sendBtn.addEventListener('click', handleSend);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    });
    
    inputArea.appendChild(input);
    inputArea.appendChild(sendBtn);
    
    window.appendChild(header);
    window.appendChild(messages);
    window.appendChild(inputArea);
    
    this.shadow.innerHTML = '';
    this.shadow.appendChild(window);

    // Show welcome message only if it hasn't been shown yet and the chat is being opened
    const welcomeMessage = this.getAttribute('welcome-message');
    if (welcomeMessage && !this.hasShownWelcomeMessage && this.isOpen) {
      this.addSystemMessage(welcomeMessage);
      this.hasShownWelcomeMessage = true;
    }
  }

  private async sendMessage(text: string) {
      const messageId = crypto.randomUUID();
      const timestamp = new Date().toISOString();
      
      const message: ChatMessage = {
        id: messageId,
        text,
        sender: 'user',
        timestamp,
        status: 'sending'
      };
  
      // Add message to storage immediately
      this.storage.addMessage(message);
      this.renderMessage(message);
  
      // Remove any existing typing indicator before adding a new one
      const oldTyping = this.shadow.querySelector('[data-message-id="typing-indicator"]');
      if (oldTyping) oldTyping.remove();
  
      // Add typing indicator (always use "Đang tra cứu thông tin ...")
      const typingMessage: ChatMessage = {
        id: 'typing-indicator',
        text: 'Đang tra cứu thông tin ...',
        sender: 'backend',
        timestamp: new Date().toISOString()
      };
      this.renderMessage(typingMessage);
  
      try {
        // Send to webhook
        const response = await this.webhook.sendMessage({
          message: text,
          timestamp,
          sessionId: this.sessionId,
          // messageId, // Remove this line, not in WebhookRequest type
          context: {
            url: window.location.href
          }
        });
  
        // Update message status
        message.status = 'sent';
        this.storage.updateMessage(messageId, { status: 'sent' });
        this.updateMessageStatus(messageId, 'sent'); // <-- Add this line

        // Remove typing indicator
        const typingEl = this.shadow.querySelector('[data-message-id="typing-indicator"]');
        if (typingEl) typingEl.remove();

        // Add response message
        const responseMessage: ChatMessage = {
          id: crypto.randomUUID(),
          text: response.output,
          sender: 'backend',
          timestamp: new Date().toISOString(),
          // replyTo: messageId // <-- Remove this line
        };
        
        this.storage.addMessage(responseMessage);
        this.renderMessage(responseMessage);
  
      } catch (error) {
        // Remove typing indicator on error as well
        const typingEl = this.shadow.querySelector('[data-message-id="typing-indicator"]');
        if (typingEl) typingEl.remove();
  
        if (error instanceof Error && error.message === 'Request cancelled') {
          message.status = 'cancelled';
          this.storage.updateMessage(messageId, { status: 'cancelled' });
          this.updateMessageStatus(messageId, 'cancelled');
        } else {
          message.status = 'error';
          this.storage.updateMessage(messageId, { status: 'error' });
          this.updateMessageStatus(messageId, 'error');
          this.addSystemMessage('Failed to send message. Please try again.');
        }
      }
  }

  private createMessageElement(message: string, isUser: boolean = false): HTMLElement {
    const messageEl = this.createElement('div', `message ${isUser ? 'user' : 'bot'}`);
    if (message === 'Đang tra cứu thông tin ...') {
      messageEl.classList.add('typing');
      messageEl.innerHTML = `
        <span>Đang tra cứu thông tin </span>
        <svg width="24" height="6" viewBox="0 0 24 6" xmlns="http://www.w3.org/2000/svg" fill="#666">
          <circle cx="3" cy="3" r="3">
            <animate attributeName="opacity" values="0;1;0" dur="1s" repeatCount="indefinite" begin="0s" />
          </circle>
          <circle cx="12" cy="3" r="3">
            <animate attributeName="opacity" values="0;1;0" dur="1s" repeatCount="indefinite" begin="0.2s" />
          </circle>
          <circle cx="21" cy="3" r="3">
            <animate attributeName="opacity" values="0;1;0" dur="1s" repeatCount="indefinite" begin="0.4s" />
          </circle>
        </svg>
      `;
    } else {
      // Clear textContent before markdown is parsed and rendered
      messageEl.textContent = '';
      if (!isUser) {
        const autolink = (text: string) =>
          text.replace(/(https?:\/\/[^\s]+)/g, url => `[${url}](${url})`);
        const linked = autolink(message);
        messageEl.innerHTML = marked.parse(linked) as string;
      } else {
        messageEl.textContent = message;
      }
    }
    return messageEl;
  }

  private renderMessage(message: ChatMessage, container?: HTMLElement) {
    const messages = container || this.shadow.querySelector('.messages');
    if (!messages) return;

    const messageEl = this.createMessageElement(message.text, message.sender === 'user');
    messageEl.dataset.messageId = message.id;

    if (message.sender === 'user' && message.status) {
      const statusEl = this.createElement('div', 'message-status');
      statusEl.textContent = message.status;
      
      if (message.status === 'sending') {
        const cancelBtn = this.createElement('button', 'cancel-button', 'Cancel');
        cancelBtn.addEventListener('click', () => {
          this.webhook.cancelRequest();
        });
        statusEl.appendChild(cancelBtn);
      }
      
      messageEl.appendChild(statusEl);
    }

    messages.appendChild(messageEl);
    messages.scrollTop = messages.scrollHeight;
    
    // If the message contains links, fetch and append link previews
    if (message.sender !== 'user') {
      const links = messageEl.querySelectorAll('a[href]');
      links.forEach(async (link) => {
        const anchor = link as HTMLAnchorElement;
        const preview = await this.fetchLinkPreview(anchor.href);
        if (preview) {
          const previewEl = document.createElement('div');
          previewEl.className = 'link-preview';
          previewEl.innerHTML = `
  <style>
    @media (prefers-color-scheme: dark) {
      .preview-wrapper {
        background: #2c2c2c !important;
        border-color: #444 !important;
        color: #eee !important;
      }

      .preview-wrapper div {
        color: #aaa !important;
      }
    }
  </style>
  <a href="${anchor.href}" target="_blank" style="text-decoration:none;color:inherit;">
    <div class="preview-wrapper" style="display:flex;border:1px solid #ccc;border-radius:12px;overflow:hidden;margin-top:12px;padding:12px;box-sizing:border-box;gap:12px;background:#fff;">
      <img src="${preview.image}" style="width:80px;height:80px;object-fit:cover;" />
      <div style="flex:1;">
        <div style="font-weight:bold;">${preview.title}</div>
        <div style="font-size:13px;color:#666;">${preview.description}</div>
      </div>
    </div>
  </a>
`;
          link.parentElement?.appendChild(previewEl);
        }
      });
    }
  }
  
  private async fetchLinkPreview(url: string): Promise<{ title: string, description: string, image: string } | null> {
    try {
      const response = await fetch(`https://n8n.naai.studio/webhook/link-preview?url=${encodeURIComponent(url)}`);
      if (!response.ok) return null;
      const data = await response.json();
      const preview = Array.isArray(data) ? data[0] : data;
      return {
        title: preview.title || url,
        description: preview.description || '',
        image: preview.image || preview.images?.[0] || ''
      };
    } catch {
      return null;
    }
  }
  
  private updateMessageStatus(messageId: string, status: string) {
    const messageEl = this.shadow.querySelector(`[data-message-id="${messageId}"]`);
    if (messageEl) {
      const statusEl = messageEl.querySelector('.message-status');
      if (statusEl) {
        statusEl.textContent = status;
      }
    }
  }

  private clearHistory() {
    if (confirm('Are you sure you want to clear the chat history?')) {
      this.storage.clearHistory();
      const messages = this.shadow.querySelector('.messages');
      if (messages) {
        messages.innerHTML = '';
      }
      // Reset welcome message flag when history is cleared
      this.hasShownWelcomeMessage = false;
    }
  }

  private addSystemMessage(text: string) {
    const message: ChatMessage = {
      id: crypto.randomUUID(),
      text,
      sender: 'system',
      timestamp: new Date().toISOString()
    };
    
    if (this.getAttribute('history-enabled') !== 'false') {
      this.storage.addMessage(message);
    }
    
    this.renderMessage(message);
  }

  private close() {
    this.isOpen = false;
    this.updateVisibility();
    this.dispatchEvent(new CustomEvent('toggleChat', {
      detail: { isOpen: false },
      bubbles: true,
      composed: true
    }));
    this.dispatchEvent(new CustomEvent('close'));
  }

  public setOpen(open: boolean, fromUserClick = false) {
    this.isOpen = open;
    this.updateVisibility();
    
    if (open && fromUserClick) {
      // Focus immediately when opened from user click
      this.focusInput();
    }
    
    // If opening the chat and no messages exist, show welcome message
    if (open && !this.hasShownWelcomeMessage) {
      const welcomeMessage = this.getAttribute('welcome-message');
      if (welcomeMessage) {
        this.addSystemMessage(welcomeMessage);
        this.hasShownWelcomeMessage = true;
      }
    }
  }

  private updateVisibility() {
    const window = this.shadow.querySelector('.chat-window');
    if (window) {
      if (this.isOpen) {
        window.classList.add('open');
      } else {
        window.classList.remove('open');
      }
    }
  }

  private focusInput() {
    const input = this.shadow.querySelector('.input-area input') as HTMLInputElement;
    if (input) {
      input.focus();
      setTimeout(() => {
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue !== newValue) {
      if (name === 'webhook-url') {
        const webhookUrl = newValue || '';
        this.storage = new StorageService(webhookUrl);
        this.webhook = new WebhookService(webhookUrl);
      }
      // Re-render to update all attributes
      this.render();
    }
  }
}

customElements.define('chat-window', ChatWindow);

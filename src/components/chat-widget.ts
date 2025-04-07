import { BaseComponent } from './base-component';
import './chat-launcher';
import './chat-window';

export class ChatWidget extends BaseComponent {
  static get observedAttributes() {
    return [
      'webhook-url',
      'theme-color',
      'position',
      'title',
      'welcome-message',
      'history-enabled',
      'history-clear-button'
    ];
  }

  private styles = `
    :host {
      position: fixed;
      z-index: 9999;
      bottom: 20px;
      right: 20px;
      font-family: system-ui, -apple-system, sans-serif;
    }

    :host([position="bottom-left"]) {
      right: auto;
      left: 20px;
    }

    .chat-widget-container {
      --theme-color: ${this.getConfig().themeColor};
    }
  `;

  private window: HTMLElement | null = null;

  constructor() {
    super();
    this.addStyles(this.styles);
    this.render();
  }

  protected render(): void {
    this.shadow.innerHTML = '';
    const container = this.createElement('div', 'chat-widget-container');
    const config = this.getConfig();
    
    // Create chat window
    const window = document.createElement('chat-window');
    window.setAttribute('webhook-url', config.webhookUrl);
    window.setAttribute('title', config.title);
    window.setAttribute('welcome-message', config.welcomeMessage);
    window.setAttribute('history-enabled', String(config.historyEnabled));
    window.setAttribute('history-clear-button', String(config.historyClearButton));
    window.setAttribute('position', config.position);
    this.window = window;
    
    // Create launcher
    const launcher = document.createElement('chat-launcher');
    launcher.addEventListener('toggleChat', (e: Event) => {
      const { isOpen } = (e as CustomEvent).detail;
      this.handleToggleChat(isOpen);
    });
    
    container.appendChild(window);
    container.appendChild(launcher);
    this.shadow.appendChild(container);
  }

  private handleToggleChat(isOpen: boolean) {
    if (this.window) {
      (this.window as any).setOpen(isOpen);
    }
  }

  private getConfig() {
    return {
      webhookUrl: this.getAttribute('webhook-url') || '',
      themeColor: this.getAttribute('theme-color') || '#1E40AF',
      position: this.getAttribute('position') || 'bottom-right',
      title: this.getAttribute('title') || 'Chat with us',
      welcomeMessage: this.getAttribute('welcome-message') || '',
      historyEnabled: this.getAttribute('history-enabled') !== 'false',
      historyClearButton: this.getAttribute('history-clear-button') !== 'false'
    };
  }

  attributeChangedCallback(_name: string, oldValue: string, newValue: string) {
    if (oldValue !== newValue) {
      const styles = this.styles;
      this.addStyles(styles);
      this.render();
    }
  }
}

customElements.define('chat-widget', ChatWidget);
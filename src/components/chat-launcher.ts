import { BaseComponent } from './base-component';

export class ChatLauncher extends BaseComponent {
  private styles = `
    .launcher {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background-color: var(--theme-color, #1E40AF);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s ease;
    }

    .launcher:hover {
      transform: scale(1.05);
    }

    .launcher svg {
      width: 28px;
      height: 28px;
      fill: white;
    }
  `;

  private isOpen = false;

  constructor() {
    super();
    this.addStyles(this.styles);
    this.render();
  }

  static get observedAttributes() {
    return ['theme-color'];
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue !== newValue && name === 'theme-color') {
      this.render();
    }
  }

  protected render(): void {
    this.shadow.innerHTML = '';
    
    const launcher = this.createElement('button', 'launcher');
    launcher.innerHTML = this.getChatIcon();
    launcher.addEventListener('click', () => this.toggleChat());
    
    this.shadow.appendChild(launcher);
  }

  private toggleChat() {
    this.isOpen = !this.isOpen;
    const event = new CustomEvent('toggleChat', { 
      detail: { isOpen: this.isOpen },
      bubbles: true,
      composed: true 
    });
    this.dispatchEvent(event);
    console.log('Chat toggle event dispatched:', this.isOpen);
  }

  private getChatIcon(): string {
    return `
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
      </svg>
    `;
  }
}

customElements.define('chat-launcher', ChatLauncher);
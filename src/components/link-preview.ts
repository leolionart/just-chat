import { BaseComponent } from './base-component';

class LinkPreview extends BaseComponent {
  static get observedAttributes() {
    return ['url', 'title', 'description', 'image'];
  }

  private styles = `
    .preview-container {
      display: flex;
      border: 1px solid #ccc;
      border-radius: 12px;
      overflow: hidden;
      margin-top: 12px;
      padding: 12px;
      box-sizing: border-box;
      gap: 12px;
      background: #fff;
      text-decoration: none;
      color: inherit;
    }

    .preview-image {
      width: 80px;
      height: 80px;
      object-fit: cover;
    }

    .preview-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .preview-title {
      font-weight: bold;
    }

    .preview-description {
      font-size: 13px;
      color: #666;
    }
    @media (prefers-color-scheme: dark) {
        .preview-container {
          background: #2c2c2c !important;
          border-color: #444 !important;
          color: #eee !important;
        }
        .preview-description {
          color: #aaa !important;
        }
      }
  `;

  constructor() {
    super();
    this.addStyles(this.styles);
  }

  connectedCallback() {
    this.render();
  }

  protected render(): void {
    const url = this.getAttribute('url') || '';
    const title = this.getAttribute('title') || 'Link Preview';
    const description = this.getAttribute('description') || '';
    const image = this.getAttribute('image') || '';

    const container = this.createElement('a', 'preview-container') as HTMLAnchorElement;
    container.href = url;
    container.target = '_blank';
    const img = this.createElement('img', 'preview-image') as HTMLImageElement;
    img.src = image;
    img.alt = title;
    const content = this.createElement('div', 'preview-content');
    const titleEl = this.createElement('div', 'preview-title', title);
    const descriptionEl = this.createElement('div', 'preview-description', description);
    content.appendChild(titleEl);
    content.appendChild(descriptionEl);
    container.appendChild(img);
    container.appendChild(content);
    this.shadow.innerHTML = '';
    this.shadow.appendChild(container);
  }

  attributeChangedCallback(oldValue: string, newValue: string): void {
    if (oldValue !== newValue) {
      this.render();
    }
  }
}

customElements.define('link-preview', LinkPreview);
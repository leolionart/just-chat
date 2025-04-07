import './components/chat-widget';

// Export for NPM package
export function initChatPopup(config: {
  webhookUrl: string;
  themeColor?: string;
  position?: 'bottom-right' | 'bottom-left';
  title?: string;
  welcomeMessage?: string;
  history?: {
    enabled?: boolean;
    clearButton?: boolean;
  };
}) {
  const widget = document.createElement('chat-widget');
  
  widget.setAttribute('webhook-url', config.webhookUrl);
  if (config.themeColor) widget.setAttribute('theme-color', config.themeColor);
  if (config.position) widget.setAttribute('position', config.position);
  if (config.title) widget.setAttribute('title', config.title);
  if (config.welcomeMessage) widget.setAttribute('welcome-message', config.welcomeMessage);
  if (config.history?.enabled !== undefined) widget.setAttribute('history-enabled', String(config.history.enabled));
  if (config.history?.clearButton !== undefined) widget.setAttribute('history-clear-button', String(config.history.clearButton));

  document.body.appendChild(widget);
  return widget;
}

// Auto-initialize if script is loaded via CDN
if (document.currentScript instanceof HTMLScriptElement) {
  const script = document.currentScript;
  initChatPopup({
    webhookUrl: script.dataset.webhookUrl || '',
    themeColor: script.dataset.themeColor,
    position: script.dataset.position as 'bottom-right' | 'bottom-left',
    title: script.dataset.title,
    welcomeMessage: script.dataset.welcomeMessage,
    history: {
      enabled: script.dataset.historyEnabled !== 'false',
      clearButton: script.dataset.historyClearButton !== 'false'
    }
  });
}

# Universal Chat Popup

A lightweight, customizable chat widget that can be easily embedded into any website. Built with Web Components for maximum compatibility and style isolation.

## Installation

### Via CDN (Recommended)

```html
<!-- Latest version -->
<script src="https://cdn.jsdelivr.net/npm/@leolionart/just-chat/dist/just-chat.umd.js"
        data-webhook-url="https://your-backend.com/chat"
        data-theme-color="#1E40AF"
        data-position="bottom-right"
        data-title="Chat with us"
        data-welcome-message="How can we help you today?"
        data-history-enabled="true"
        data-history-clear-button="true"
        defer>
</script>

<!-- Specific version -->
<script src="https://cdn.jsdelivr.net/npm/@leolionart/just-chat@0.1.5/dist/just-chat.umd.js"
        data-webhook-url="https://your-backend.com/chat"
        defer>
</script>
```


## Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| webhookUrl | string | - | (Required) Backend endpoint URL for processing messages |
| themeColor | string | '#1E40AF' | Primary color for UI elements |
| position | 'bottom-right' \| 'bottom-left' | 'bottom-right' | Widget position on screen |
| title | string | 'Chat with us' | Chat window title |
| welcomeMessage | string | '' | Initial message shown when chat opens |
| history.enabled | boolean | true | Enable/disable chat history persistence |
| history.clearButton | boolean | true | Show/hide the clear history button |

## Features in Detail

### Message Status Indicators

Messages show their current status:
- 🔄 Sending: Message is being sent to the webhook
- ✅ Sent: Message was successfully delivered
- ❌ Error: Failed to send message
- ⚪ Cancelled: User cancelled the message

### History Management

Chat history is stored in LocalStorage:
- Persists across page reloads
- Separate storage per webhook URL
- Optional clear history button
- Automatic loading of previous messages

### Webhook Integration

The widget sends POST requests to your webhook URL with the following JSON payload:

```typescript
{
  message: string;          // User's message
  timestamp: string;        // ISO8601 timestamp
  sessionId: string;        // Unique session identifier
  context: {
    url: string;           // Current page URL
  };
  history?: Array<{        // Last 10 messages (if any)
    id: string;
    text: string;
    sender: 'user' | 'backend' | 'system';
    timestamp: string;
  }>;
}
```

Expected response format:

```typescript
{
  response: string;        // Text message to display to the user
}
```


## Development

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Setup

1. Clone the repository
```bash
git clone https://github.com/draphonix/just-chat.git
cd just-chat
```

2. Install dependencies
```bash
pnpm install
```

3. Start development server
```bash
pnpm dev
```

4. Build for production
```bash
pnpm build
```


### Project Structure

```
just-chat/
├── src/
│   ├── components/        # Web Components
│   │   ├── base-component.ts
│   │   ├── chat-widget.ts
│   │   ├── chat-launcher.ts
│   │   └── chat-window.ts
│   ├── services/         # Core services
│   │   ├── storage.ts
│   │   └── webhook.ts
│   └── main.ts          # Entry point
├── dist/                # Built files
├── mock-server.js      # Test server
└── package.json
```

## Publishing to NPM
1. Update the version in `package.json`
2. Build the library
```bash
pnpm build
```
3. Publish to NPM
```bash
npm publish --access public
```
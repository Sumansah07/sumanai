# Groq Chat - Premium AI Assistant

A fully production-ready, premium AI chatbot web application built with Next.js 15 and powered by Groq's lightning-fast AI models. Experience ChatGPT-level quality with a beautiful dark-themed interface, real-time streaming responses, and comprehensive conversation management.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)
![Groq](https://img.shields.io/badge/Groq-API-orange?style=flat-square)

## ✨ Features

### Core Functionality
- **Real-time Streaming Responses** - Watch AI responses generate word-by-word with smooth streaming
- **Dynamic Model Selection** - Choose from all available Groq models fetched live from the API
- **Custom System Prompts** - Define AI behavior with customizable system prompts
- **Conversation History** - Full chat history with auto-generated titles and persistence
- **Syntax-Highlighted Code** - Beautiful code blocks with language detection and copy functionality
- **Rich Markdown Rendering** - Full markdown support including tables, lists, and formatting

### Premium UI/UX
- **Dark Theme Design** - Professional dark interface matching ChatGPT/Claude aesthetics
- **Smooth Animations** - Polished transitions and hover states throughout
- **Responsive Layout** - Works seamlessly on desktop and mobile devices
- **Keyboard Shortcuts** - Enter to send, Shift+Enter for new lines
- **Auto-scroll** - Intelligent scroll behavior during streaming

### Advanced Features
- **Temperature Control** - Fine-tune response creativity from 0 to 1
- **Conversation Management** - Delete individual chats or clear all history
- **Import/Export** - Backup and restore your conversation history
- **Error Handling** - Graceful error recovery with user-friendly messages
- **localStorage Persistence** - Conversations persist across browser sessions

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- A Groq API key (get one at [console.groq.com/keys](https://console.groq.com/keys))

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd groq-chatbot
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure your Groq API Key**

   **IMPORTANT:** You must add your Groq API key for the app to work!

   Create a `.env.local` file in the project root directory:
   ```env
   GROQ_API_KEY=gsk_your_actual_api_key_here
   ```

   **How to get your API key:**
   - Go to [https://console.groq.com/keys](https://console.groq.com/keys)
   - Sign in or create an account
   - Click "Create API Key"
   - Copy the key (it starts with `gsk_`)
   - Replace `your_actual_api_key_here` in the `.env.local` file with your key

4. **Run the development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

   The app will show you an API setup helper if your key is not configured correctly.

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Markdown**: react-markdown with rehype-highlight
- **Syntax Highlighting**: highlight.js
- **State Management**: React Context + useReducer
- **Storage**: localStorage for persistence

## 📁 Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── api/               # API routes
│   │   ├── chat/          # Chat completion endpoint
│   │   └── models/        # Model fetching endpoint
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page
├── components/            # React components
│   ├── ChatInput.tsx      # Message input component
│   ├── ChatView.tsx       # Main chat interface
│   ├── Message.tsx        # Message display with markdown
│   ├── Sidebar.tsx        # Conversation history sidebar
│   ├── SystemPromptModal.tsx  # System prompt editor
│   ├── SettingsModal.tsx  # Temperature settings
│   └── TopBar.tsx         # Model selector bar
├── context/               # React Context
│   └── ChatContext.tsx    # Global chat state management
├── lib/                   # Utilities
│   ├── storage.ts         # localStorage management
│   └── utils.ts           # Helper functions
└── types/                 # TypeScript definitions
    └── chat.ts            # Type definitions
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `GROQ_API_KEY` | Your Groq API key from [console.groq.com/keys](https://console.groq.com/keys) | **Yes** | `gsk_abcd1234...` |
| `GROQ_API_BASE_URL` | Custom API endpoint (optional) | No | `https://api.groq.com/openai/v1` |

⚠️ **Note:** The app will not work without a valid `GROQ_API_KEY`. The built-in API helper will guide you through the setup process.

### Available Models

The app dynamically fetches available models from Groq's API. Common models include:
- **llama-3.3-70b-versatile** - Large, versatile model with 32K context
- **mixtral-8x7b-32768** - Mixtral model with 32K context
- **gemma-7b-it** - Google's Gemma model with 8K context

### Customization

#### System Prompts
Access the system prompt editor via the settings button in the top bar. Pre-configured templates include:
- Coding Assistant
- Creative Writer
- Study Tutor
- Business Consultant

#### Temperature Settings
Adjust response creativity:
- **0.0** - Deterministic (most focused)
- **0.3** - Focused (recommended for coding)
- **0.7** - Balanced (default)
- **1.0** - Creative (most varied)

## 🎯 Usage Tips

### Keyboard Shortcuts
- `Enter` - Send message
- `Shift + Enter` - New line in message
- `Escape` - Close modals

### Best Practices
1. **Model Selection**: Choose larger models for complex tasks, smaller ones for simple queries
2. **Temperature**: Use lower values (0.2-0.4) for factual/coding tasks, higher (0.7-1.0) for creative writing
3. **System Prompts**: Craft specific prompts for better results in specialized tasks
4. **Context Management**: Start new conversations for unrelated topics to maintain context clarity

## 📦 Building for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

For deployment, consider platforms like:
- Vercel (recommended for Next.js)
- Netlify
- Railway
- Self-hosted with Docker

## 🔒 Security

- API keys are never exposed to the client
- All Groq API calls go through server-side API routes
- Environment variables are properly secured
- No sensitive data is stored in localStorage

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

- [Groq](https://groq.com) for the blazing-fast inference API
- [Next.js](https://nextjs.org) team for the amazing framework
- [Tailwind CSS](https://tailwindcss.com) for the utility-first CSS framework
- All open-source contributors

## 🐛 Troubleshooting

### Common Issues

**"Failed to fetch models: 401" Error**
- This means your API key is missing or invalid
- Check that `.env.local` exists in your project root
- Verify your API key starts with `gsk_`
- Make sure you've restarted the dev server after adding the key
- Get a new key at [https://console.groq.com/keys](https://console.groq.com/keys)

**API Key Not Working**
1. Check the `.env.local` file is in the root directory (same level as `package.json`)
2. Ensure the format is exactly: `GROQ_API_KEY=gsk_your_key_here`
3. No quotes around the key value
4. Restart the development server after changes
5. Test your setup by visiting: `http://localhost:3000/api/test`

**Models not loading**
- Verify your Groq API key is correct
- Check your internet connection
- Ensure the API key has proper permissions

**Streaming not working**
- Confirm your browser supports Server-Sent Events
- Check for any browser extensions blocking connections
- Try clearing browser cache

**Conversations not persisting**
- Ensure localStorage is enabled in your browser
- Check browser privacy settings
- Verify you're not in incognito/private mode

### Support

For issues and questions:
1. Check the [Issues](https://github.com/your-repo/issues) page
2. Review existing discussions
3. Create a new issue with detailed information

---

Built with ❤️ using Next.js and Groq
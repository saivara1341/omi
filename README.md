# RADHIKA - Adaptive Reasoning & Intelligence Assistant
A sophisticated AI-powered assistant built with Next.js and powered by Groq's lightning-fast LLM inference. RADHIKA adapts to different modes of interaction, providing specialized assistance for productivity, wellness, learning, and creative tasks.

## ✨ Features

### 🎯 **Multi-Mode Intelligence**
- **General Assistant**: All-purpose AI companion for everyday queries
- **Productivity Coach**: Task management, planning, and organization expert
- **Wellness Guide**: Health, fitness, and mental well-being support
- **Learning Mentor**: Personalized education and skill development
- **Creative Partner**: Brainstorming, ideation, and creative project assistance

### 🚀 **Smart Model Selection**
- Automatically selects optimal models based on query complexity
- Fast responses for casual conversations
- Advanced reasoning for complex problem-solving
- Enhanced creativity for artistic and innovative tasks

### 💬 **Advanced Chat Interface**
- Real-time streaming responses
- Persistent chat history across sessions
- Mode-specific conversation contexts
- Beautiful, responsive UI with dark/light themes

### 🎤 **Voice Integration**
- Speech-to-text input
- Hands-free interaction capability
- Visual feedback for voice recording status

### ⚡ **Quick Actions**
- Pre-defined prompts for each mode
- One-click access to common tasks
- Context-aware suggestions

## 🛠️ Tech Stack
- **Framework**: Next.js 14 with App Router
- **AI Integration**: Vercel AI SDK with Groq
- **Styling**: Tailwind CSS + shadcn/ui components
- **Icons**: Lucide React
- **Speech**: Webkit Speech Recognition
- **Storage**: Local Storage for chat persistence

## 💃 Models Keywords
```ts
// Determine which model to use based on the conversation context
let modelType = "fast"; // llama-3.1-8b-instant

// Use reasoning model for complex tasks
if (
  lastMessage.includes("analyze") ||
  lastMessage.includes("compare") ||
  lastMessage.includes("plan") ||
  lastMessage.includes("strategy") ||
  lastMessage.includes("decision") ||
  lastMessage.includes("problem")
) {
  modelType = "reasoning"; // llama-3.3-70b-versatile
}

// Use creative model for creative tasks
if (
  lastMessage.includes("creative") ||
  lastMessage.includes("brainstorm") ||
  lastMessage.includes("idea") ||
  lastMessage.includes("write") ||
  lastMessage.includes("design") ||
  lastMessage.includes("story")
) {
  modelType = "creative"; // qwen/qwen3-32b
}
```

## 🚀 Getting Started

### Prerequisites
- NextJS 14
- Groq API key

### Installation
1. **Clone the repository**

   ```bash
   git clone https://github.com/RS-labhub/radhika.git
   cd radhika
   ```

2. **Install dependencies**

   ```bash
   bun install
   ```

3. **Set up environment variables**

   ```bash
   touch .env
   ```

   Add your Groq API key:

   ```
   GROQ_API_KEY=your_groq_api_key_here
   ```

4. **Run the development server**

   ```bash
   bun run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🎮 Usage

### Selecting Modes
Click on any of the five mode buttons at the top to switch RADHIKA's personality and expertise:

- 🧠 **General** - For everyday questions and conversations
- 🎯 **Productivity** - For task management and planning
- ❤️ **Wellness** - For health and well-being guidance
- 📚 **Learning** - For educational support and skill development
- 💡 **Creative** - For brainstorming and creative projects

### Quick Actions
Each mode provides quick action buttons with pre-defined prompts to get you started quickly.

### Voice Input
Click the microphone button to use voice input. The button will turn red while recording.

### Chat Management
- Conversations are automatically saved per mode
- Use the trash button to clear the current mode's chat history
- Switch between light and dark themes using the theme toggle

## 🏗️ Project Structure
```
RADHIKA-assistant/
├── app/
│   ├── api/chat/route.ts      # Chat API endpoint with Groq integration
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Main application component
├── components/
│   └── ui/                    # shadcn/ui components
├── types/
│   └── speech.d.ts            # Speech recognition type definitions
└── lib/
    └── utils.ts               # Utility functions
```

## 🔧 Configuration

### Models Used
- **Fast Model**: `llama-3.1-8b-instant` - For quick responses
- **Reasoning Model**: `llama-3.1-70b-versatile` - For complex analysis
- **Creative Model**: `llama-3.1-70b-versatile` - For creative tasks

### Customization
You can customize RADHIKA by modifying:

- **System prompts** in `app/api/chat/route.ts`
- **Mode configurations** in `app/page.tsx`
- **Quick actions** for each mode
- **UI themes** and styling

## 🌟 Key Features Explained

### Adaptive Model Selection
RADHIKA automatically chooses the best model based on your query:

- Keywords like "analyze", "compare", "plan" trigger the reasoning model
- Keywords like "creative", "brainstorm", "write" use the creative model
- Default queries use the fast model for quick responses

### Persistent Chat History
Each mode maintains its own conversation history, stored locally in your browser. Switch between modes without losing context.

### Responsive Design
Fully responsive interface that works seamlessly on desktop, tablet, and mobile devices.

## 🤝 Contributing
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support
If you encounter any issues or have questions, please open an issue on GitHub or contact `rs4101976@gmail.com`.

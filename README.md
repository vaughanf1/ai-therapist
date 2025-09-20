# AI Therapist App

A minimalistic AI therapist application that uses OpenAI's Realtime API to provide voice-based therapy sessions with custom progress tracking and milestone achievements.

## Features

### 🎙️ Voice Interface
- Real-time voice conversation with AI therapist using OpenAI's Realtime API
- Natural speech-to-speech processing without complex conversion chains
- Voice activity visualization with clean, minimalistic design
- Volume control and mute functionality

### 🌟 Progress Tracking
- Automatic milestone detection based on conversation analysis
- Custom progress cards generated after each session
- 10 different milestone types including emotional breakthroughs, anxiety management, and confidence building
- Beautiful, animated progress card gallery

### 📊 Session Management
- Complete session history with searchable transcripts
- Session statistics and duration tracking
- Data persistence with configurable retention periods
- Export and replay capabilities

### 🎨 Design Philosophy
- Minimalist, premium Apple-style aesthetic
- Soft shadows and rounded corners throughout
- Primary color: #0A84FF (Apple Blue)
- Inter typography, responsive design
- Smooth animations with Framer Motion

## Getting Started

### Prerequisites
- Node.js 18+ 
- OpenAI API key with Realtime API access

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-therapist-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Configuration

1. Navigate to Settings in the app
2. Enter your OpenAI API key
3. Configure audio and privacy settings
4. Save your preferences

## Usage

### Starting a Session
1. Click "Start Session" on the main screen
2. Allow microphone permissions when prompted
3. Wait for connection to OpenAI Realtime API
4. Begin speaking naturally - the AI therapist will respond

### Voice Controls
- **Microphone Button**: Toggle recording on/off
- **Volume Slider**: Adjust playback volume
- **Mute Button**: Mute/unmute audio output

### Progress Cards
- Automatically generated based on session milestones
- View in the Progress tab
- Celebrates achievements like emotional breakthroughs, coping strategies, and self-awareness moments

### Session History
- View all past sessions in the History tab
- Search through transcripts and milestones
- Sort by date, duration, or milestone count
- Expand sessions to see detailed transcripts

## Technology Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **OpenAI Realtime API** for voice processing
- **Web Audio API** for voice recording
- **Local Storage** for data persistence

## Architecture

```
src/
├── components/          # React components
│   ├── Header.tsx      # Navigation header
│   ├── VoiceInterface.tsx    # Main voice chat interface
│   ├── VoiceVisualizer.tsx   # Audio visualization
│   ├── ProgressCards.tsx     # Progress card display
│   ├── SessionHistory.tsx    # Session history view
│   └── Settings.tsx    # App configuration
├── hooks/              # Custom React hooks
│   └── useVoiceRecording.ts  # Voice recording logic
├── services/           # External service integrations
│   └── openaiRealtime.ts     # OpenAI API wrapper
├── types/              # TypeScript type definitions
│   └── index.ts        # Core app types
├── utils/              # Utility functions
│   └── milestoneDetection.ts # AI milestone detection
└── styles/             # CSS and styling
    └── globals.css     # Global styles and components
```

## Privacy & Security

- API keys stored locally, never transmitted to our servers
- Session data stored locally with configurable retention
- OpenAI's privacy policy applies to API interactions
- Option to clear all data at any time

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript checks

### Adding New Milestone Types

1. Add new type to `MilestoneType` in `types/index.ts`
2. Update `MILESTONE_PATTERNS` in `utils/milestoneDetection.ts`
3. Add icon and color mappings in `components/ProgressCards.tsx`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with proper TypeScript types
4. Test thoroughly with voice interactions
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Check the GitHub Issues page
- Review OpenAI's Realtime API documentation
- Ensure your API key has appropriate permissions
# F.R.I.D.A.Y. AI Agent

F.R.I.D.A.Y. (Female Replacement Intelligent Digital Assistant Youth) is an interactive, custom-built AI assistant created by the author, heavily inspired by the legend Tony Stark and his digital assistant. Built with a modern full-stack JavaScript architecture, this application features a Heads-Up Display (HUD) interface, voice-to-text recognition, and text-to-speech synthesis, all powered by a robust LLM backend.

## 🚀 Features

- **Heads-Up Display (HUD)**: A dynamic, sci-fi inspired UI with real-time simulated system diagnostics, glowing borders, and smooth animations using Framer Motion.
- **Voice Interactions**: 
  - **Voice Output (TTS)**: F.R.I.D.A.Y. reads her responses aloud, strictly configured to locate and use native female voices for an authentic experience.
  - **Voice Input (STT)**: Users can click the microphone to speak their commands directly, powered by the Web Speech API.
- **Groq AI Integration**: Lightning-fast intelligent responses powered by Groq's LLaMA 3.3 models, specifically prompted to emulate F.R.I.D.A.Y.'s precise, loyal, and witty personality.

## 🏗️ System Architecture

The project follows a standard decoupled Client-Server architecture to ensure security (hiding API keys) and modularity.

### 1. Frontend (`/fr-hud`)
- **Framework**: React 18 powered by Vite.
- **Styling**: Tailwind CSS for rapid utility-class styling, augmented with custom CSS (`index.css`) for complex glowing effects and grid backgrounds.
- **Icons & Animations**: `lucide-react` for scalable SVG icons, and `framer-motion` for fluid component mounting and HUD status rings.
- **Speech Subsystem**: Utilizes `window.SpeechRecognition` to capture user audio commands and `window.speechSynthesis` to vocalize the AI's response with tailored pitch and rate settings to sound slightly synthetic.

### 2. Backend (`/`)
- **Server**: Node.js with Express.
- **Routing**: Cleanly separated routes (`src/routes`) mapping to controllers (`src/controllers`).
- **AI Service (`src/services/aiService.js`)**: Acts as a bridge between the client and the Groq LLM. It manages the conversation history, formats the `system` prompts to enforce the F.R.I.D.A.Y. persona, and securely handles the `GROQ_API_KEY`.

### 3. Data Flow
1. User speaks or types a command in the React HUD.
2. The frontend sends an HTTP POST request to the Express backend (`/api/chat`) containing the prompt and previous conversation history.
3. The Express controller forwards this to the `aiService`.
4. `aiService` constructs an OpenAI-compatible payload and queries the Groq API.
5. The LLM generates a response in character.
6. The backend returns the text to the frontend.
7. The React UI updates the chat log and invokes the Text-to-Speech API to read the response out loud.

## 🛠️ Setup & Installation

### Prerequisites
- Node.js (v18 or higher recommended)
- A Groq API Key

### Backend Setup
1. Open a terminal in the root directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Ensure your `.env` file is configured:
   ```env
   PORT=5001
   GROQ_API_KEY=your_groq_api_key_here
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Open a second terminal and navigate to the HUD directory:
   ```bash
   cd fr-hud
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite server:
   ```bash
   npm run dev
   ```

## 🌐 Usage
Navigate to `http://localhost:5173` in your browser. Ensure your browser allows microphone access if you intend to use the voice commands. Click the microphone icon to speak, or type into the command line to interact.

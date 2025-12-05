# NeuroLoad - Cognitive Performance Tracker for Combat Athletes

NeuroLoad is a mobile application designed to help combat athletes monitor neurological performance changes through weekly cognitive assessments. This is a wellness and performance tracking tool, not a medical diagnostic application.

## Features

- **Speech Analysis**: Record audio clips and track speech patterns (words per minute, filler words, pause length)
- **Cognitive Tests**: Reaction time and working memory assessments
- **Eye Movement Tracking**: Basic visual-motor performance metrics
- **Neuro Load Score**: Combined weekly score showing cognitive drift from baseline
- **Trend Dashboard**: Visual graphs and insights showing performance over time

## Project Structure

```
braingauge1/
├── backend/          # Python FastAPI backend
├── mobile/           # React Native mobile app
├── docs/             # Documentation
└── README.md
```

## Quick Start

### Prerequisites

- Python 3.8+ (for backend)
- Node.js 16+ and npm (for mobile app)
- OpenAI API key (for Whisper speech-to-text)

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
# Add your OpenAI API key to .env file
python run.py
```

Backend runs on http://localhost:8000

### Mobile App Setup

```bash
cd mobile
npm install
# For iOS
npx react-native run-ios
# For Android
npx react-native run-android
```

## Configuration

Create a `.env` file in the `backend/` directory:

```
OPENAI_API_KEY=your_openai_api_key_here
DATABASE_URL=sqlite:///./neuroload.db
```

## Documentation

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed setup instructions.

## License

MIT

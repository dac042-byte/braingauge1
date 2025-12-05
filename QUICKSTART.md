# NeuroLoad Quick Start Guide

Get up and running with NeuroLoad in 5 minutes!

## Prerequisites

- Python 3.8+
- Node.js 16+
- OpenAI API key (get one at https://platform.openai.com/api-keys)

## Backend Setup (2 minutes)

```bash
# 1. Go to backend directory
cd backend

# 2. Install dependencies
pip install -r requirements.txt

# 3. Create .env file with your OpenAI API key
cp .env.example .env
# Edit .env and add: OPENAI_API_KEY=sk-your-key-here

# 4. Start server
python run.py
```

Backend is now running at http://localhost:8000

Visit http://localhost:8000/docs to see the API documentation!

## Mobile App Setup (3 minutes)

Open a new terminal:

```bash
# 1. Go to mobile directory
cd mobile

# 2. Install dependencies
npm install

# 3. Configure API endpoint
# Edit src/config.js and set API_BASE_URL:
# - iOS Simulator: http://localhost:8000/api
# - Android Emulator: http://10.0.2.2:8000/api
# - Physical Device: http://YOUR_IP:8000/api

# 4. Run the app

# For iOS (Mac only):
npx react-native run-ios

# For Android:
npx react-native run-android
```

## First Use

1. **Register**: Enter a username when you first open the app
2. **Baseline**: Complete your baseline assessment (all 3 tests)
3. **Weekly Check-ins**: Return each week to track changes
4. **Dashboard**: View your Neuro Load Score and trends

## Troubleshooting

**Backend won't start?**
- Check that Python 3.8+ is installed: `python3 --version`
- Verify your OpenAI API key in `.env` file

**Mobile app can't connect?**
- Make sure backend is running at http://localhost:8000
- Check API_BASE_URL in `mobile/src/config.js`
- For Android emulator, use `10.0.2.2` instead of `localhost`

**Need more help?**
- Read [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed instructions
- Check [API_GUIDE.md](./API_GUIDE.md) for API documentation

## Project Structure

```
braingauge1/
├── backend/           # Python FastAPI backend
│   ├── app/
│   │   ├── api/      # API routes
│   │   ├── core/     # Config, database
│   │   ├── models/   # Database models
│   │   └── services/ # Business logic
│   └── run.py        # Server entry point
│
├── mobile/            # React Native app
│   ├── src/
│   │   ├── screens/  # App screens
│   │   ├── services/ # API client
│   │   └── navigation/
│   └── App.js        # App entry point
│
└── docs/             # Documentation
```

## What's Included

### Backend Features
- ✅ User management
- ✅ OpenAI Whisper speech-to-text integration
- ✅ Speech feature extraction (WPM, filler words, pauses)
- ✅ Cognitive test data processing
- ✅ Visual tracking analysis
- ✅ Neuro Load Score calculation
- ✅ Weekly trend tracking
- ✅ SQLite database with automatic migrations
- ✅ RESTful API with Swagger docs

### Mobile App Features
- ✅ User onboarding
- ✅ Baseline assessment flow
- ✅ Weekly check-in coordinator
- ✅ Speech recording with audio analysis
- ✅ Reaction time test
- ✅ Working memory test (2-back)
- ✅ Eye tracking simulation
- ✅ Dashboard with score visualization
- ✅ Line charts for weekly trends
- ✅ Insights and recommendations
- ✅ Profile management
- ✅ Offline data storage

## API Endpoints

```
POST   /api/users                           Create user
GET    /api/users/{id}                      Get user
POST   /api/assessments/start               Start assessment
POST   /api/assessments/{id}/speech         Upload speech
POST   /api/assessments/{id}/cognitive      Submit cognitive test
POST   /api/assessments/{id}/visual         Submit visual test
POST   /api/assessments/{id}/complete       Complete assessment
GET    /api/users/{id}/dashboard            Get dashboard
GET    /api/users/{id}/history              Get history
```

Full API documentation: http://localhost:8000/docs

## Next Steps

1. ✅ Complete your baseline assessment
2. ✅ Explore the dashboard and insights
3. ✅ Review the code in `backend/app/` and `mobile/src/`
4. ✅ Customize score weights in `backend/app/core/config.py`
5. ✅ Adjust UI colors in `mobile/src/config.js`

## Customization

### Backend Configuration

Edit `backend/app/core/config.py`:
- Adjust score calculation weights
- Modify speech analysis parameters
- Change recording duration limits

### Mobile Configuration

Edit `mobile/src/config.js`:
- Update API endpoint
- Adjust test trial counts
- Customize color scheme
- Modify score thresholds

## Cost Estimation

**OpenAI Whisper API:**
- $0.006 per minute of audio
- Each assessment: ~30-60 seconds
- Cost per assessment: ~$0.003-$0.006

**For 100 assessments:** ~$0.30-$0.60

## Support

- 📖 [Full Setup Guide](./SETUP_GUIDE.md)
- 📚 [API Documentation](./API_GUIDE.md)
- 🌐 [Interactive API Docs](http://localhost:8000/docs)

---

**You're ready to go! Start tracking your cognitive performance with NeuroLoad.**

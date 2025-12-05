# NeuroLoad Setup Guide

This guide will help you set up and run the NeuroLoad application, including both the backend API server and the mobile application.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Backend Setup](#backend-setup)
3. [Mobile App Setup](#mobile-app-setup)
4. [API Configuration](#api-configuration)
5. [Running the Application](#running-the-application)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### For Backend (Python)

- **Python 3.8 or higher**
  - Check version: `python3 --version`
  - Download from: https://www.python.org/downloads/

- **pip** (Python package manager)
  - Usually comes with Python
  - Check version: `pip3 --version`

### For Mobile App (React Native)

- **Node.js 16 or higher**
  - Check version: `node --version`
  - Download from: https://nodejs.org/

- **npm** (Node package manager)
  - Comes with Node.js
  - Check version: `npm --version`

- **React Native CLI** (optional but recommended)
  ```bash
  npm install -g react-native-cli
  ```

### For iOS Development (Mac only)

- **Xcode** (latest version)
  - Download from Mac App Store
  - Install Command Line Tools: `xcode-select --install`

- **CocoaPods**
  ```bash
  sudo gem install cocoapods
  ```

### For Android Development

- **Android Studio**
  - Download from: https://developer.android.com/studio
  - Install Android SDK and emulator through Android Studio

- **Java Development Kit (JDK)**
  - JDK 11 recommended
  - Check version: `java --version`

### OpenAI API Key

- You need an OpenAI API key for Whisper speech-to-text
- Get your key from: https://platform.openai.com/api-keys
- Save this key - you'll need it for configuration

---

## Backend Setup

### Step 1: Navigate to Backend Directory

```bash
cd backend
```

### Step 2: Create Virtual Environment (Recommended)

**On macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

**On Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

### Step 3: Install Python Dependencies

```bash
pip install -r requirements.txt
```

This will install:
- FastAPI (web framework)
- Uvicorn (ASGI server)
- OpenAI (for Whisper API)
- SQLAlchemy (database)
- And other required packages

### Step 4: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file and add your OpenAI API key:
   ```bash
   nano .env
   # or use any text editor
   ```

3. Update the following line with your actual API key:
   ```
   OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

4. Optional: Adjust other settings if needed:
   ```
   DATABASE_URL=sqlite:///./neuroload.db
   BACKEND_HOST=0.0.0.0
   BACKEND_PORT=8000
   ```

### Step 5: Test Backend Installation

Run the backend server:

```bash
python run.py
```

You should see output like:
```
INFO:     Started server process
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

Test the API by visiting in your browser:
- http://localhost:8000 - Root endpoint
- http://localhost:8000/docs - Interactive API documentation (Swagger UI)

If you see the API docs, the backend is working correctly!

Press `Ctrl+C` to stop the server for now.

---

## Mobile App Setup

### Step 1: Navigate to Mobile Directory

```bash
cd ../mobile
# or from project root: cd mobile
```

### Step 2: Install Node Dependencies

```bash
npm install
```

This will install all required React Native packages. This may take a few minutes.

### Step 3: Configure API Endpoint

1. Open `src/config.js` in a text editor

2. Update the `API_BASE_URL` based on where you're running:

   **For iOS Simulator:**
   ```javascript
   export const API_BASE_URL = 'http://localhost:8000/api';
   ```

   **For Android Emulator:**
   ```javascript
   export const API_BASE_URL = 'http://10.0.2.2:8000/api';
   ```

   **For Physical Device (same WiFi network):**
   ```javascript
   export const API_BASE_URL = 'http://YOUR_COMPUTER_IP:8000/api';
   ```

   To find your computer's IP address:
   - **macOS/Linux:** `ifconfig | grep inet`
   - **Windows:** `ipconfig`
   - Look for your local network IP (usually starts with 192.168.x.x)

### Step 4: iOS-Specific Setup (Mac only)

If you're building for iOS:

```bash
cd ios
pod install
cd ..
```

This installs iOS native dependencies.

### Step 5: Android-Specific Setup

1. Make sure Android Studio is installed
2. Open Android Studio and install the Android SDK
3. Set up environment variables (add to `~/.bashrc` or `~/.zshrc`):

   ```bash
   export ANDROID_HOME=$HOME/Library/Android/sdk  # macOS
   # or
   export ANDROID_HOME=$HOME/Android/Sdk  # Linux

   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/tools
   export PATH=$PATH:$ANDROID_HOME/tools/bin
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

4. Reload your terminal or run `source ~/.bashrc`

---

## API Configuration

### OpenAI Whisper API

The backend uses OpenAI's Whisper API for speech transcription. Here's how it works:

1. **API Key**: Set in `backend/.env` file
   ```
   OPENAI_API_KEY=sk-your-api-key-here
   ```

2. **Model**: Uses `whisper-1` model (hardcoded in `backend/app/services/speech_analysis.py`)

3. **Pricing**:
   - Whisper API costs $0.006 per minute of audio
   - Each assessment uses ~30-60 seconds of audio
   - Approximately $0.003-$0.006 per assessment

4. **Testing API**:
   ```bash
   # Test if your API key works
   curl https://api.openai.com/v1/models \
     -H "Authorization: Bearer YOUR_API_KEY"
   ```

### Backend Configuration Options

Edit `backend/app/core/config.py` to adjust:

- Speech analysis parameters (words per minute targets, filler words list)
- Score calculation weights (speech, cognitive, visual)
- Recording duration limits
- Upload file size limits

---

## Running the Application

### Step 1: Start the Backend Server

In the `backend` directory:

```bash
# Make sure virtual environment is activated
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Start the server
python run.py
```

The server will run on http://localhost:8000

**Leave this terminal window open** - the server needs to keep running.

### Step 2: Start the Mobile App

Open a **new terminal window/tab** and navigate to the `mobile` directory:

**For iOS (Mac only):**
```bash
cd mobile
npx react-native run-ios
```

This will:
1. Build the app
2. Start the Metro bundler
3. Launch the iOS Simulator
4. Install and run the app

**For Android:**
```bash
cd mobile

# Make sure an Android emulator is running or device is connected
# To start an emulator:
# Open Android Studio > AVD Manager > Start an emulator

npx react-native run-android
```

### Step 3: Using the App

1. **First Launch**: You'll see the onboarding screen
   - Enter a username (required)
   - Optionally enter an email
   - Tap "Get Started"

2. **Baseline Assessment**:
   - Your first check-in establishes your baseline
   - Complete all three tests (speech, cognitive, visual)
   - This baseline is used for future comparisons

3. **Weekly Check-Ins**:
   - Return each week to complete assessments
   - View your Neuro Load Score and trends
   - Check insights for performance analysis

4. **Dashboard**:
   - View your current Neuro Load Score
   - See score breakdown (speech, cognitive, visual)
   - Track weekly trends on graph

---

## Troubleshooting

### Backend Issues

**Problem: `Module not found` errors**
```bash
# Solution: Reinstall dependencies
pip install -r requirements.txt
```

**Problem: `OPENAI_API_KEY not found` error**
```bash
# Solution: Check your .env file
cat .env
# Make sure OPENAI_API_KEY is set correctly
```

**Problem: Database errors**
```bash
# Solution: Delete and recreate database
rm neuroload.db
python run.py  # Database will be recreated automatically
```

**Problem: Port 8000 already in use**
```bash
# Solution: Kill the process using port 8000
# On macOS/Linux:
lsof -ti:8000 | xargs kill -9

# On Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Or change the port in backend/.env:
BACKEND_PORT=8001
```

### Mobile App Issues

**Problem: Metro bundler won't start**
```bash
# Solution: Clear cache and restart
npx react-native start --reset-cache
```

**Problem: Cannot connect to backend API**
- Check that backend server is running
- Verify API_BASE_URL in `mobile/src/config.js`
- For physical devices, make sure phone and computer are on same WiFi
- Try accessing `http://YOUR_IP:8000/api/health` in phone browser

**Problem: iOS build fails**
```bash
# Solution: Clean and rebuild
cd mobile/ios
pod deintegrate
pod install
cd ..
npx react-native run-ios
```

**Problem: Android build fails**
```bash
# Solution: Clean gradle cache
cd mobile/android
./gradlew clean
cd ..
npx react-native run-android
```

**Problem: Audio recording not working**
- Make sure you've granted microphone permissions
- On iOS: Settings > NeuroLoad > Allow Microphone
- On Android: Settings > Apps > NeuroLoad > Permissions > Microphone

### Common React Native Issues

**Problem: `command not found: react-native`**
```bash
# Solution: Use npx instead
npx react-native run-ios
# or install globally
npm install -g react-native-cli
```

**Problem: Xcode errors on macOS**
```bash
# Solution: Update Xcode command line tools
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
sudo xcodebuild -license accept
```

**Problem: Android SDK not found**
```bash
# Solution: Set ANDROID_HOME environment variable
# Add to ~/.bashrc or ~/.zshrc:
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

---

## Development Tips

### Viewing API Logs

The backend server logs all requests. Watch the terminal where you ran `python run.py` to see:
- API requests
- Database queries
- Errors and exceptions

### Using the API Documentation

Visit http://localhost:8000/docs for interactive API documentation where you can:
- View all available endpoints
- Test API calls directly in browser
- See request/response schemas

### Database Management

The SQLite database file is located at `backend/neuroload.db`

To view/edit the database:
```bash
# Install SQLite browser (macOS)
brew install --cask db-browser-for-sqlite

# Or use command line
sqlite3 backend/neuroload.db
```

Common queries:
```sql
-- View all users
SELECT * FROM users;

-- View all assessments
SELECT * FROM assessments;

-- View user's assessment history
SELECT week_number, neuro_load_score, assessment_date
FROM assessments
WHERE user_id = 1
ORDER BY week_number;
```

### Hot Reloading

- **Backend**: Auto-reloads when you change Python files (uvicorn reload mode)
- **Mobile**: Fast refresh enabled - shake device and enable "Fast Refresh"

### Testing the Speech API

Test speech analysis without the mobile app:

```bash
curl -X POST http://localhost:8000/api/assessments/1/speech \
  -F "audio=@test_audio.m4a"
```

---

## Next Steps

1. **Test the full flow**:
   - Create a user
   - Complete baseline assessment
   - Do a weekly check-in
   - View dashboard and insights

2. **Customize settings**:
   - Adjust score thresholds in `mobile/src/config.js`
   - Modify speech analysis parameters in `backend/app/core/config.py`

3. **Explore the API**:
   - Visit http://localhost:8000/docs
   - Try different endpoints
   - View the response data

4. **Read the code**:
   - Backend: Start with `backend/app/main.py`
   - Mobile: Start with `mobile/App.js` and `mobile/src/navigation/AppNavigator.js`

---

## Additional Resources

- **React Native Documentation**: https://reactnative.dev/docs/getting-started
- **FastAPI Documentation**: https://fastapi.tiangolo.com/
- **OpenAI API Documentation**: https://platform.openai.com/docs/api-reference
- **SQLAlchemy Documentation**: https://docs.sqlalchemy.org/

---

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the terminal logs for error messages
3. Make sure all prerequisites are installed
4. Verify your OpenAI API key is valid and has credits

---

**You're all set! Enjoy using NeuroLoad to track your cognitive performance.**

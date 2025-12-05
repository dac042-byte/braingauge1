# NeuroLoad API Guide

Complete guide to using the NeuroLoad backend API.

## Base URL

```
http://localhost:8000/api
```

## API Endpoints

### Health Check

Check if the API is running.

```http
GET /api/health
```

**Response:**
```json
{
  "status": "healthy",
  "service": "NeuroLoad API",
  "version": "1.0.0"
}
```

---

## User Management

### Create User

Create a new user account.

```http
POST /api/users
Content-Type: application/json

{
  "username": "fighter_mike",
  "email": "mike@example.com"
}
```

**Response:**
```json
{
  "id": 1,
  "username": "fighter_mike",
  "email": "mike@example.com",
  "created_at": "2024-01-01T12:00:00",
  "baseline_completed": false
}
```

### Get User

Retrieve user information.

```http
GET /api/users/{user_id}
```

**Response:**
```json
{
  "id": 1,
  "username": "fighter_mike",
  "email": "mike@example.com",
  "created_at": "2024-01-01T12:00:00",
  "baseline_completed": true
}
```

### List All Users

```http
GET /api/users
```

**Response:**
```json
[
  {
    "id": 1,
    "username": "fighter_mike",
    "email": "mike@example.com",
    "created_at": "2024-01-01T12:00:00",
    "baseline_completed": true
  }
]
```

---

## Assessment Workflow

### 1. Start Assessment

Begin a new weekly assessment.

```http
POST /api/assessments/start
Content-Type: multipart/form-data

user_id=1&week_number=1&is_baseline=true
```

**Response:**
```json
{
  "message": "Assessment started",
  "assessment_id": 1,
  "is_baseline": true
}
```

### 2. Submit Speech Recording

Upload and analyze audio recording.

```http
POST /api/assessments/{assessment_id}/speech
Content-Type: multipart/form-data

audio=@recording.m4a
```

**Response:**
```json
{
  "message": "Speech recording analyzed successfully",
  "metrics": {
    "words_per_minute": 145.5,
    "filler_word_count": 3,
    "avg_pause_length": 0.234,
    "speech_rate": 2.42,
    "total_words": 87,
    "recording_duration": 36.0,
    "transcript": "The quick brown fox..."
  },
  "drift_score": 12.5
}
```

### 3. Submit Cognitive Test Results

Submit reaction time and memory test data.

```http
POST /api/assessments/{assessment_id}/cognitive
Content-Type: application/json

{
  "avg_reaction_time": 285.6,
  "reaction_time_std": 42.3,
  "reaction_accuracy": 0.95,
  "memory_accuracy": 0.87,
  "memory_response_time": 1250.5,
  "reaction_trials": [
    {"time": 275, "correct": true},
    {"time": 298, "correct": true}
  ],
  "memory_trials": [
    {"index": 0, "value": 5, "response": false, "correct": true}
  ]
}
```

**Response:**
```json
{
  "message": "Cognitive test submitted successfully",
  "metrics": {
    "id": 1,
    "avg_reaction_time": 285.6,
    "reaction_time_std": 42.3,
    "reaction_accuracy": 0.95,
    "memory_accuracy": 0.87,
    "memory_response_time": 1250.5
  },
  "drift_score": 8.3
}
```

### 4. Submit Visual Tracking Data

Submit eye tracking results.

```http
POST /api/assessments/{assessment_id}/visual
Content-Type: application/json

{
  "blink_frequency": 0.4,
  "smooth_pursuit_accuracy": 0.89,
  "tracking_duration": 10.0,
  "tracking_data": [
    {"timestamp": 1234567890, "x": 150, "y": 200}
  ]
}
```

**Response:**
```json
{
  "message": "Visual tracking submitted successfully",
  "metrics": {
    "id": 1,
    "blink_frequency": 0.4,
    "smooth_pursuit_accuracy": 0.89,
    "tracking_duration": 10.0
  },
  "drift_score": 5.7
}
```

### 5. Complete Assessment

Finalize assessment and calculate Neuro Load Score.

```http
POST /api/assessments/{assessment_id}/complete
```

**Response:**
```json
{
  "message": "Assessment completed",
  "assessment_id": 1,
  "neuro_load_score": 9.2,
  "drift_scores": {
    "speech": 12.5,
    "cognitive": 8.3,
    "visual": 5.7
  },
  "insights": {
    "status": "Stable",
    "status_color": "green",
    "message": "Your cognitive performance is stable. Continue your current routine.",
    "primary_area": "speech",
    "area_message": "Speech patterns show the most change...",
    "scores": {
      "neuro_load": 9.2,
      "speech_drift": 12.5,
      "cognitive_drift": 8.3,
      "visual_drift": 5.7
    }
  }
}
```

---

## Dashboard & Analytics

### Get User Dashboard

Retrieve dashboard with current score and weekly history.

```http
GET /api/users/{user_id}/dashboard
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "username": "fighter_mike",
    "email": "mike@example.com",
    "created_at": "2024-01-01T12:00:00",
    "baseline_completed": true
  },
  "current_week": 5,
  "baseline_completed": true,
  "total_assessments": 5,
  "latest_score": {
    "neuro_load_score": 9.2,
    "speech_drift_score": 12.5,
    "cognitive_drift_score": 8.3,
    "visual_drift_score": 5.7
  },
  "weekly_history": [
    {
      "week_number": 1,
      "date": "2024-01-01T12:00:00",
      "neuro_load_score": 0.0,
      "is_baseline": true
    },
    {
      "week_number": 2,
      "date": "2024-01-08T12:00:00",
      "neuro_load_score": 8.5,
      "is_baseline": false
    }
  ],
  "insights": {
    "status": "Stable",
    "message": "Your cognitive performance is stable...",
    "primary_area": "speech"
  }
}
```

### Get User History

Get assessment history with optional limit.

```http
GET /api/users/{user_id}/history?limit=12
```

**Response:**
```json
{
  "assessments": [
    {
      "id": 5,
      "week_number": 5,
      "date": "2024-02-01T12:00:00",
      "neuro_load_score": 9.2,
      "speech_drift": 12.5,
      "cognitive_drift": 8.3,
      "visual_drift": 5.7,
      "is_baseline": false
    }
  ]
}
```

### Get Single Assessment

Retrieve detailed assessment data.

```http
GET /api/assessments/{assessment_id}
```

**Response:**
```json
{
  "id": 1,
  "user_id": 1,
  "week_number": 2,
  "assessment_date": "2024-01-08T12:00:00",
  "is_baseline": false,
  "neuro_load_score": 8.5,
  "speech_drift_score": 10.2,
  "cognitive_drift_score": 7.8,
  "visual_drift_score": 6.5,
  "speech_metrics": {
    "id": 1,
    "words_per_minute": 145.5,
    "filler_word_count": 3,
    "avg_pause_length": 0.234,
    "speech_rate": 2.42,
    "total_words": 87,
    "recording_duration": 36.0,
    "transcript": "The quick brown fox..."
  },
  "cognitive_metrics": {
    "id": 1,
    "avg_reaction_time": 285.6,
    "reaction_time_std": 42.3,
    "reaction_accuracy": 0.95,
    "memory_accuracy": 0.87,
    "memory_response_time": 1250.5
  },
  "visual_metrics": {
    "id": 1,
    "blink_frequency": 0.4,
    "smooth_pursuit_accuracy": 0.89,
    "tracking_duration": 10.0
  }
}
```

---

## Score Interpretation

### Neuro Load Score Range

- **0-14**: Stable - No significant changes detected
- **15-34**: Minor Changes - Small deviations from baseline
- **35-59**: Moderate Changes - Notable performance shifts
- **60-100**: Significant Changes - Major deviations detected

### Drift Scores

Each component (speech, cognitive, visual) has its own drift score (0-100):

- **Speech Drift**: Changes in speaking rate, filler words, pauses
- **Cognitive Drift**: Changes in reaction time, accuracy, memory
- **Visual Drift**: Changes in blink rate, tracking accuracy

### Score Calculation

The Neuro Load Score is calculated as:

```
Neuro Load = (Speech * 0.35) + (Cognitive * 0.40) + (Visual * 0.25)
```

Weights can be adjusted in `backend/app/core/config.py`.

---

## Error Responses

### Common Error Codes

**400 Bad Request**
```json
{
  "detail": "Username already exists"
}
```

**404 Not Found**
```json
{
  "detail": "User not found"
}
```

**500 Internal Server Error**
```json
{
  "detail": "Failed to transcribe audio: API key invalid"
}
```

---

## Example Workflow (cURL)

Complete assessment workflow using cURL:

```bash
# 1. Create user
curl -X POST http://localhost:8000/api/users \
  -H "Content-Type: application/json" \
  -d '{"username":"test_user","email":"test@example.com"}'

# Response: {"id": 1, ...}

# 2. Start baseline assessment
curl -X POST http://localhost:8000/api/assessments/start \
  -F "user_id=1" \
  -F "week_number=1" \
  -F "is_baseline=true"

# Response: {"assessment_id": 1, ...}

# 3. Upload speech recording
curl -X POST http://localhost:8000/api/assessments/1/speech \
  -F "audio=@recording.m4a"

# 4. Submit cognitive test
curl -X POST http://localhost:8000/api/assessments/1/cognitive \
  -H "Content-Type: application/json" \
  -d '{
    "avg_reaction_time": 285.6,
    "reaction_time_std": 42.3,
    "reaction_accuracy": 0.95,
    "memory_accuracy": 0.87,
    "memory_response_time": 1250.5
  }'

# 5. Submit visual tracking
curl -X POST http://localhost:8000/api/assessments/1/visual \
  -H "Content-Type: application/json" \
  -d '{
    "blink_frequency": 0.4,
    "smooth_pursuit_accuracy": 0.89,
    "tracking_duration": 10.0
  }'

# 6. Complete assessment
curl -X POST http://localhost:8000/api/assessments/1/complete

# 7. Get dashboard
curl http://localhost:8000/api/users/1/dashboard
```

---

## Python Example

```python
import requests

BASE_URL = "http://localhost:8000/api"

# Create user
user_data = {
    "username": "python_user",
    "email": "python@example.com"
}
response = requests.post(f"{BASE_URL}/users", json=user_data)
user = response.json()
user_id = user["id"]

# Start assessment
assessment_data = {
    "user_id": user_id,
    "week_number": 1,
    "is_baseline": True
}
response = requests.post(
    f"{BASE_URL}/assessments/start",
    data=assessment_data
)
assessment = response.json()
assessment_id = assessment["assessment_id"]

# Upload speech recording
with open("recording.m4a", "rb") as audio_file:
    files = {"audio": audio_file}
    response = requests.post(
        f"{BASE_URL}/assessments/{assessment_id}/speech",
        files=files
    )
    print(response.json())

# Get dashboard
response = requests.get(f"{BASE_URL}/users/{user_id}/dashboard")
dashboard = response.json()
print(f"Neuro Load Score: {dashboard['latest_score']['neuro_load_score']}")
```

---

## JavaScript/Axios Example

```javascript
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const BASE_URL = 'http://localhost:8000/api';

async function runAssessment() {
  // Create user
  const userResponse = await axios.post(`${BASE_URL}/users`, {
    username: 'js_user',
    email: 'js@example.com'
  });
  const userId = userResponse.data.id;

  // Start assessment
  const formData = new FormData();
  formData.append('user_id', userId);
  formData.append('week_number', 1);
  formData.append('is_baseline', true);

  const assessmentResponse = await axios.post(
    `${BASE_URL}/assessments/start`,
    formData
  );
  const assessmentId = assessmentResponse.data.assessment_id;

  // Upload speech
  const audioFormData = new FormData();
  audioFormData.append('audio', fs.createReadStream('recording.m4a'));

  await axios.post(
    `${BASE_URL}/assessments/${assessmentId}/speech`,
    audioFormData,
    { headers: audioFormData.getHeaders() }
  );

  // Get dashboard
  const dashboardResponse = await axios.get(
    `${BASE_URL}/users/${userId}/dashboard`
  );
  console.log('Dashboard:', dashboardResponse.data);
}

runAssessment();
```

---

## Rate Limits & Performance

- No rate limits implemented (add if deploying to production)
- Speech transcription takes 5-15 seconds depending on audio length
- Database queries are optimized with indexes
- Recommend max 10 concurrent assessment submissions

---

## Security Considerations

**For Development:**
- CORS is wide open (`allow_origins=["*"]`)
- No authentication required
- SQLite database with no encryption

**For Production:**
- Add authentication (JWT tokens)
- Restrict CORS to specific origins
- Use PostgreSQL with SSL
- Add API rate limiting
- Encrypt sensitive data
- Implement user sessions

---

## Interactive API Documentation

Visit http://localhost:8000/docs for interactive Swagger UI where you can:
- Test all endpoints
- See request/response schemas
- Try API calls directly in browser

---

**For more information, see the SETUP_GUIDE.md file.**

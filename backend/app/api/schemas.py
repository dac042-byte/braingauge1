from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict
from datetime import datetime


# User schemas
class UserCreate(BaseModel):
    username: str
    email: Optional[EmailStr] = None


class UserResponse(BaseModel):
    id: int
    username: str
    email: Optional[str]
    created_at: datetime
    baseline_completed: bool

    class Config:
        from_attributes = True


# Speech schemas
class SpeechMetricsCreate(BaseModel):
    words_per_minute: float
    filler_word_count: int
    avg_pause_length: float
    speech_rate: float
    total_words: int
    recording_duration: float
    transcript: str


class SpeechMetricsResponse(BaseModel):
    id: int
    words_per_minute: float
    filler_word_count: int
    avg_pause_length: float
    speech_rate: float
    total_words: int
    recording_duration: float
    transcript: Optional[str]

    class Config:
        from_attributes = True


# Cognitive schemas
class CognitiveMetricsCreate(BaseModel):
    avg_reaction_time: float
    reaction_time_std: float
    reaction_accuracy: float
    memory_accuracy: float
    memory_response_time: float
    reaction_trials: Optional[List[Dict]] = None
    memory_trials: Optional[List[Dict]] = None


class CognitiveMetricsResponse(BaseModel):
    id: int
    avg_reaction_time: float
    reaction_time_std: float
    reaction_accuracy: float
    memory_accuracy: float
    memory_response_time: float

    class Config:
        from_attributes = True


# Visual schemas
class VisualMetricsCreate(BaseModel):
    blink_frequency: float
    smooth_pursuit_accuracy: float
    tracking_duration: float
    tracking_data: Optional[List[Dict]] = None


class VisualMetricsResponse(BaseModel):
    id: int
    blink_frequency: float
    smooth_pursuit_accuracy: float
    tracking_duration: float

    class Config:
        from_attributes = True


# Assessment schemas
class AssessmentCreate(BaseModel):
    user_id: int
    week_number: int
    is_baseline: bool = False


class AssessmentResponse(BaseModel):
    id: int
    user_id: int
    week_number: int
    assessment_date: datetime
    is_baseline: bool
    neuro_load_score: Optional[float]
    speech_drift_score: Optional[float]
    cognitive_drift_score: Optional[float]
    visual_drift_score: Optional[float]
    speech_metrics: Optional[SpeechMetricsResponse]
    cognitive_metrics: Optional[CognitiveMetricsResponse]
    visual_metrics: Optional[VisualMetricsResponse]

    class Config:
        from_attributes = True


class WeeklyCheckInRequest(BaseModel):
    user_id: int
    week_number: int


class NeuroLoadScoreResponse(BaseModel):
    neuro_load_score: float
    speech_drift_score: float
    cognitive_drift_score: float
    visual_drift_score: float
    insights: Dict


class DashboardResponse(BaseModel):
    user: UserResponse
    current_week: int
    latest_score: Optional[NeuroLoadScoreResponse]
    weekly_history: List[AssessmentResponse]
    insights: Dict

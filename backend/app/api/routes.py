from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, Form
from sqlalchemy.orm import Session
from typing import List
import os
import shutil
from datetime import datetime, timedelta

from app.core.database import get_db
from app.api import schemas
from app.models import User, Assessment, SpeechMetrics, CognitiveMetrics, VisualMetrics
from app.services.speech_analysis import SpeechAnalysisService
from app.services.score_calculator import ScoreCalculator
from app.core.config import settings

router = APIRouter()
speech_service = SpeechAnalysisService()
score_calculator = ScoreCalculator()


# ============================================================================
# USER ENDPOINTS
# ============================================================================

@router.post("/users", response_model=schemas.UserResponse)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """Create a new user"""
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already exists")

    new_user = User(
        username=user.username,
        email=user.email
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.get("/users/{user_id}", response_model=schemas.UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    """Get user by ID"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.get("/users", response_model=List[schemas.UserResponse])
def list_users(db: Session = Depends(get_db)):
    """List all users"""
    return db.query(User).all()


# ============================================================================
# SPEECH ANALYSIS ENDPOINTS
# ============================================================================

@router.post("/assessments/{assessment_id}/speech")
async def upload_speech_recording(
    assessment_id: int,
    audio: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload and analyze speech recording

    Args:
        assessment_id: ID of the assessment
        audio: Audio file (mp3, wav, m4a, etc.)

    Returns:
        Speech metrics
    """
    # Check if assessment exists
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    # Save uploaded file
    file_path = os.path.join(settings.UPLOAD_DIR, f"speech_{assessment_id}_{audio.filename}")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(audio.file, buffer)

    try:
        # Transcribe audio using OpenAI Whisper
        transcript_data = await speech_service.transcribe_audio(file_path)

        # Extract speech features
        speech_features = speech_service.extract_speech_features(
            transcript_data,
            transcript_data.get("duration", 0)
        )

        # Save speech metrics
        speech_metrics = SpeechMetrics(
            assessment_id=assessment_id,
            words_per_minute=speech_features["words_per_minute"],
            filler_word_count=speech_features["filler_word_count"],
            avg_pause_length=speech_features["avg_pause_length"],
            speech_rate=speech_features["speech_rate"],
            total_words=speech_features["total_words"],
            recording_duration=speech_features["recording_duration"],
            transcript=speech_features["transcript"],
            audio_file_path=file_path
        )
        db.add(speech_metrics)

        # Calculate drift score if not baseline
        if not assessment.is_baseline:
            baseline = db.query(Assessment).filter(
                Assessment.user_id == assessment.user_id,
                Assessment.is_baseline == True
            ).first()

            if baseline and baseline.speech_metrics:
                baseline_metrics = {
                    "words_per_minute": baseline.speech_metrics.words_per_minute,
                    "filler_word_count": baseline.speech_metrics.filler_word_count,
                    "avg_pause_length": baseline.speech_metrics.avg_pause_length
                }
                drift_score = speech_service.calculate_speech_drift(
                    speech_features,
                    baseline_metrics
                )
                assessment.speech_drift_score = drift_score

        db.commit()
        db.refresh(speech_metrics)

        return {
            "message": "Speech recording analyzed successfully",
            "metrics": speech_features,
            "drift_score": assessment.speech_drift_score
        }

    except Exception as e:
        # Clean up file on error
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# COGNITIVE TEST ENDPOINTS
# ============================================================================

@router.post("/assessments/{assessment_id}/cognitive")
def submit_cognitive_test(
    assessment_id: int,
    metrics: schemas.CognitiveMetricsCreate,
    db: Session = Depends(get_db)
):
    """Submit cognitive test results"""
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    # Save cognitive metrics
    cognitive_metrics = CognitiveMetrics(
        assessment_id=assessment_id,
        avg_reaction_time=metrics.avg_reaction_time,
        reaction_time_std=metrics.reaction_time_std,
        reaction_accuracy=metrics.reaction_accuracy,
        memory_accuracy=metrics.memory_accuracy,
        memory_response_time=metrics.memory_response_time,
        reaction_trials=metrics.reaction_trials,
        memory_trials=metrics.memory_trials
    )
    db.add(cognitive_metrics)

    # Calculate drift score if not baseline
    if not assessment.is_baseline:
        baseline = db.query(Assessment).filter(
            Assessment.user_id == assessment.user_id,
            Assessment.is_baseline == True
        ).first()

        if baseline and baseline.cognitive_metrics:
            baseline_metrics = {
                "avg_reaction_time": baseline.cognitive_metrics.avg_reaction_time,
                "reaction_accuracy": baseline.cognitive_metrics.reaction_accuracy,
                "memory_accuracy": baseline.cognitive_metrics.memory_accuracy
            }
            current_metrics = {
                "avg_reaction_time": metrics.avg_reaction_time,
                "reaction_accuracy": metrics.reaction_accuracy,
                "memory_accuracy": metrics.memory_accuracy
            }
            drift_score = score_calculator.calculate_cognitive_drift(
                current_metrics,
                baseline_metrics
            )
            assessment.cognitive_drift_score = drift_score

    db.commit()
    db.refresh(cognitive_metrics)

    return {
        "message": "Cognitive test submitted successfully",
        "metrics": cognitive_metrics,
        "drift_score": assessment.cognitive_drift_score
    }


# ============================================================================
# VISUAL TRACKING ENDPOINTS
# ============================================================================

@router.post("/assessments/{assessment_id}/visual")
def submit_visual_tracking(
    assessment_id: int,
    metrics: schemas.VisualMetricsCreate,
    db: Session = Depends(get_db)
):
    """Submit visual tracking results"""
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    # Save visual metrics
    visual_metrics = VisualMetrics(
        assessment_id=assessment_id,
        blink_frequency=metrics.blink_frequency,
        smooth_pursuit_accuracy=metrics.smooth_pursuit_accuracy,
        tracking_duration=metrics.tracking_duration,
        tracking_data=metrics.tracking_data
    )
    db.add(visual_metrics)

    # Calculate drift score if not baseline
    if not assessment.is_baseline:
        baseline = db.query(Assessment).filter(
            Assessment.user_id == assessment.user_id,
            Assessment.is_baseline == True
        ).first()

        if baseline and baseline.visual_metrics:
            baseline_metrics = {
                "blink_frequency": baseline.visual_metrics.blink_frequency,
                "smooth_pursuit_accuracy": baseline.visual_metrics.smooth_pursuit_accuracy
            }
            current_metrics = {
                "blink_frequency": metrics.blink_frequency,
                "smooth_pursuit_accuracy": metrics.smooth_pursuit_accuracy
            }
            drift_score = score_calculator.calculate_visual_drift(
                current_metrics,
                baseline_metrics
            )
            assessment.visual_drift_score = drift_score

    db.commit()
    db.refresh(visual_metrics)

    return {
        "message": "Visual tracking submitted successfully",
        "metrics": visual_metrics,
        "drift_score": assessment.visual_drift_score
    }


# ============================================================================
# ASSESSMENT ENDPOINTS
# ============================================================================

@router.post("/assessments/start")
def start_assessment(
    user_id: int = Form(...),
    week_number: int = Form(...),
    is_baseline: bool = Form(False),
    db: Session = Depends(get_db)
):
    """Start a new weekly assessment"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Create new assessment
    assessment = Assessment(
        user_id=user_id,
        week_number=week_number,
        is_baseline=is_baseline
    )
    db.add(assessment)
    db.commit()
    db.refresh(assessment)

    return {
        "message": "Assessment started",
        "assessment_id": assessment.id,
        "is_baseline": is_baseline
    }


@router.post("/assessments/{assessment_id}/complete")
def complete_assessment(assessment_id: int, db: Session = Depends(get_db)):
    """
    Complete an assessment and calculate final Neuro Load Score
    """
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    # Check if all metrics are present
    if not assessment.speech_metrics:
        raise HTTPException(status_code=400, detail="Speech metrics missing")
    if not assessment.cognitive_metrics:
        raise HTTPException(status_code=400, detail="Cognitive metrics missing")
    if not assessment.visual_metrics:
        raise HTTPException(status_code=400, detail="Visual metrics missing")

    # Calculate Neuro Load Score
    if assessment.is_baseline:
        # Baseline has no drift
        assessment.neuro_load_score = 0.0
        assessment.speech_drift_score = 0.0
        assessment.cognitive_drift_score = 0.0
        assessment.visual_drift_score = 0.0

        # Mark user baseline as completed
        user = db.query(User).filter(User.id == assessment.user_id).first()
        user.baseline_completed = True
    else:
        # Calculate Neuro Load Score from drift scores
        neuro_load = score_calculator.calculate_neuro_load_score(
            assessment.speech_drift_score or 0,
            assessment.cognitive_drift_score or 0,
            assessment.visual_drift_score or 0
        )
        assessment.neuro_load_score = neuro_load

    db.commit()
    db.refresh(assessment)

    # Generate insights
    insights = score_calculator.generate_insights(
        assessment.neuro_load_score,
        assessment.speech_drift_score or 0,
        assessment.cognitive_drift_score or 0,
        assessment.visual_drift_score or 0
    )

    return {
        "message": "Assessment completed",
        "assessment_id": assessment.id,
        "neuro_load_score": assessment.neuro_load_score,
        "drift_scores": {
            "speech": assessment.speech_drift_score,
            "cognitive": assessment.cognitive_drift_score,
            "visual": assessment.visual_drift_score
        },
        "insights": insights
    }


@router.get("/assessments/{assessment_id}", response_model=schemas.AssessmentResponse)
def get_assessment(assessment_id: int, db: Session = Depends(get_db)):
    """Get assessment by ID"""
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return assessment


# ============================================================================
# DASHBOARD ENDPOINTS
# ============================================================================

@router.get("/users/{user_id}/dashboard")
def get_dashboard(user_id: int, db: Session = Depends(get_db)):
    """Get user dashboard with weekly history and insights"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Get all assessments ordered by week
    assessments = db.query(Assessment).filter(
        Assessment.user_id == user_id
    ).order_by(Assessment.week_number.desc()).all()

    # Get latest non-baseline assessment
    latest = next((a for a in assessments if not a.is_baseline), None)

    insights = {}
    if latest and latest.neuro_load_score is not None:
        insights = score_calculator.generate_insights(
            latest.neuro_load_score,
            latest.speech_drift_score or 0,
            latest.cognitive_drift_score or 0,
            latest.visual_drift_score or 0
        )

    # Calculate current week (weeks since first assessment)
    current_week = 0
    if assessments:
        first_assessment = min(assessments, key=lambda a: a.assessment_date)
        days_since_first = (datetime.utcnow() - first_assessment.assessment_date).days
        current_week = (days_since_first // 7) + 1

    return {
        "user": user,
        "current_week": current_week,
        "baseline_completed": user.baseline_completed,
        "total_assessments": len(assessments),
        "latest_score": {
            "neuro_load_score": latest.neuro_load_score if latest else None,
            "speech_drift_score": latest.speech_drift_score if latest else None,
            "cognitive_drift_score": latest.cognitive_drift_score if latest else None,
            "visual_drift_score": latest.visual_drift_score if latest else None
        } if latest else None,
        "weekly_history": [
            {
                "week_number": a.week_number,
                "date": a.assessment_date.isoformat(),
                "neuro_load_score": a.neuro_load_score,
                "is_baseline": a.is_baseline
            }
            for a in assessments
        ],
        "insights": insights
    }


@router.get("/users/{user_id}/history")
def get_user_history(user_id: int, limit: int = 12, db: Session = Depends(get_db)):
    """Get user's assessment history"""
    assessments = db.query(Assessment).filter(
        Assessment.user_id == user_id
    ).order_by(Assessment.week_number.desc()).limit(limit).all()

    return {
        "assessments": [
            {
                "id": a.id,
                "week_number": a.week_number,
                "date": a.assessment_date.isoformat(),
                "neuro_load_score": a.neuro_load_score,
                "speech_drift": a.speech_drift_score,
                "cognitive_drift": a.cognitive_drift_score,
                "visual_drift": a.visual_drift_score,
                "is_baseline": a.is_baseline
            }
            for a in assessments
        ]
    }


# ============================================================================
# HEALTH CHECK
# ============================================================================

@router.get("/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "NeuroLoad API",
        "version": "1.0.0"
    }

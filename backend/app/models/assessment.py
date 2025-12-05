from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    week_number = Column(Integer, nullable=False)
    assessment_date = Column(DateTime, default=datetime.utcnow)
    is_baseline = Column(Boolean, default=False)

    # Composite scores
    neuro_load_score = Column(Float, nullable=True)
    speech_drift_score = Column(Float, nullable=True)
    cognitive_drift_score = Column(Float, nullable=True)
    visual_drift_score = Column(Float, nullable=True)

    # Relationships
    user = relationship("User", back_populates="assessments")
    speech_metrics = relationship("SpeechMetrics", back_populates="assessment", uselist=False, cascade="all, delete-orphan")
    cognitive_metrics = relationship("CognitiveMetrics", back_populates="assessment", uselist=False, cascade="all, delete-orphan")
    visual_metrics = relationship("VisualMetrics", back_populates="assessment", uselist=False, cascade="all, delete-orphan")


class SpeechMetrics(Base):
    __tablename__ = "speech_metrics"

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id"), nullable=False)

    # Raw metrics
    words_per_minute = Column(Float, nullable=False)
    filler_word_count = Column(Integer, nullable=False)
    avg_pause_length = Column(Float, nullable=False)
    speech_rate = Column(Float, nullable=False)
    total_words = Column(Integer, nullable=False)
    recording_duration = Column(Float, nullable=False)

    # Transcript data
    transcript = Column(String, nullable=True)
    audio_file_path = Column(String, nullable=True)

    # Relationships
    assessment = relationship("Assessment", back_populates="speech_metrics")


class CognitiveMetrics(Base):
    __tablename__ = "cognitive_metrics"

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id"), nullable=False)

    # Reaction time test
    avg_reaction_time = Column(Float, nullable=False)
    reaction_time_std = Column(Float, nullable=False)
    reaction_accuracy = Column(Float, nullable=False)

    # Working memory test
    memory_accuracy = Column(Float, nullable=False)
    memory_response_time = Column(Float, nullable=False)

    # Raw test data
    reaction_trials = Column(JSON, nullable=True)
    memory_trials = Column(JSON, nullable=True)

    # Relationships
    assessment = relationship("Assessment", back_populates="cognitive_metrics")


class VisualMetrics(Base):
    __tablename__ = "visual_metrics"

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id"), nullable=False)

    # Eye tracking metrics
    blink_frequency = Column(Float, nullable=False)
    smooth_pursuit_accuracy = Column(Float, nullable=False)
    tracking_duration = Column(Float, nullable=False)

    # Raw tracking data
    tracking_data = Column(JSON, nullable=True)

    # Relationships
    assessment = relationship("Assessment", back_populates="visual_metrics")

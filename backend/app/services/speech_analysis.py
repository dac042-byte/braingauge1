import os
import re
from typing import Dict, Optional
from openai import OpenAI
from app.core.config import settings

# Try to import numpy, fall back to basic Python if not available
try:
    import numpy as np
    HAS_NUMPY = True
except ImportError:
    HAS_NUMPY = False

client = OpenAI(api_key=settings.OPENAI_API_KEY)


class SpeechAnalysisService:
    """Service for analyzing speech using OpenAI Whisper API"""

    @staticmethod
    async def transcribe_audio(audio_file_path: str) -> Dict:
        """
        Transcribe audio file using OpenAI Whisper API

        Args:
            audio_file_path: Path to the audio file

        Returns:
            Dictionary containing transcript and word timestamps
        """
        try:
            with open(audio_file_path, "rb") as audio_file:
                transcript = client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file,
                    response_format="verbose_json",
                    timestamp_granularities=["word"]
                )

            return {
                "text": transcript.text,
                "words": transcript.words if hasattr(transcript, 'words') else [],
                "duration": transcript.duration if hasattr(transcript, 'duration') else 0
            }
        except Exception as e:
            raise Exception(f"Failed to transcribe audio: {str(e)}")

    @staticmethod
    def extract_speech_features(transcript_data: Dict, audio_duration: float) -> Dict:
        """
        Extract speech features from transcript

        Args:
            transcript_data: Dictionary containing transcript and word data
            audio_duration: Duration of audio in seconds

        Returns:
            Dictionary of speech metrics
        """
        text = transcript_data.get("text", "")
        words = transcript_data.get("words", [])

        # Count total words
        word_list = text.split()
        total_words = len(word_list)

        # Calculate words per minute
        if audio_duration > 0:
            words_per_minute = (total_words / audio_duration) * 60
            speech_rate = total_words / audio_duration
        else:
            words_per_minute = 0
            speech_rate = 0

        # Count filler words
        filler_count = 0
        text_lower = text.lower()
        for filler in settings.FILLER_WORDS:
            filler_count += len(re.findall(r'\b' + re.escape(filler) + r'\b', text_lower))

        # Calculate average pause length from word timestamps
        avg_pause_length = 0.0
        if words and len(words) > 1:
            pauses = []
            for i in range(len(words) - 1):
                current_word = words[i]
                next_word = words[i + 1]

                # Extract end time of current word and start time of next word
                if isinstance(current_word, dict):
                    current_end = current_word.get("end", 0)
                    next_start = next_word.get("start", 0)
                else:
                    current_end = getattr(current_word, 'end', 0)
                    next_start = getattr(next_word, 'start', 0)

                pause = next_start - current_end
                if pause > 0:
                    pauses.append(pause)

            if pauses:
                if HAS_NUMPY:
                    avg_pause_length = np.mean(pauses)
                else:
                    avg_pause_length = sum(pauses) / len(pauses)

        return {
            "words_per_minute": round(words_per_minute, 2),
            "filler_word_count": filler_count,
            "avg_pause_length": round(avg_pause_length, 3),
            "speech_rate": round(speech_rate, 2),
            "total_words": total_words,
            "recording_duration": audio_duration,
            "transcript": text
        }

    @staticmethod
    def calculate_speech_drift(current_metrics: Dict, baseline_metrics: Dict) -> float:
        """
        Calculate speech drift score (0-100)

        Args:
            current_metrics: Current week's speech metrics
            baseline_metrics: Baseline speech metrics

        Returns:
            Drift score (0 = no change, 100 = maximum change)
        """
        if not baseline_metrics:
            return 0.0

        # Calculate normalized differences for each metric
        wpm_diff = 0
        if baseline_metrics.get("words_per_minute", 0) > 0:
            wpm_diff = abs(current_metrics["words_per_minute"] - baseline_metrics["words_per_minute"]) / baseline_metrics["words_per_minute"]

        filler_diff = 0
        baseline_filler = baseline_metrics.get("filler_word_count", 0)
        if baseline_filler > 0:
            filler_diff = abs(current_metrics["filler_word_count"] - baseline_filler) / baseline_filler
        else:
            # If baseline had 0 fillers, any filler is a change
            if current_metrics["filler_word_count"] > 0:
                filler_diff = current_metrics["filler_word_count"] * 0.1

        pause_diff = 0
        if baseline_metrics.get("avg_pause_length", 0) > 0:
            pause_diff = abs(current_metrics["avg_pause_length"] - baseline_metrics["avg_pause_length"]) / baseline_metrics["avg_pause_length"]

        # Weighted average (cap at 1.0 to prevent extreme outliers)
        drift = min(1.0, (wpm_diff * 0.4 + filler_diff * 0.3 + pause_diff * 0.3))

        # Convert to 0-100 scale
        return round(drift * 100, 2)

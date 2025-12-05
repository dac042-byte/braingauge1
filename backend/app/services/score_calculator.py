from typing import Dict, Optional
import numpy as np
from app.core.config import settings


class ScoreCalculator:
    """Service for calculating Neuro Load Score and drift scores"""

    @staticmethod
    def calculate_cognitive_drift(current_metrics: Dict, baseline_metrics: Dict) -> float:
        """
        Calculate cognitive drift score (0-100)

        Args:
            current_metrics: Current week's cognitive metrics
            baseline_metrics: Baseline cognitive metrics

        Returns:
            Drift score (0 = no change, 100 = maximum change)
        """
        if not baseline_metrics:
            return 0.0

        # Reaction time drift (lower is better, so increase is negative)
        reaction_diff = 0
        if baseline_metrics.get("avg_reaction_time", 0) > 0:
            reaction_diff = abs(current_metrics["avg_reaction_time"] - baseline_metrics["avg_reaction_time"]) / baseline_metrics["avg_reaction_time"]

        # Reaction accuracy drift (higher is better, so decrease is negative)
        accuracy_diff = 0
        if baseline_metrics.get("reaction_accuracy", 0) > 0:
            accuracy_diff = abs(current_metrics["reaction_accuracy"] - baseline_metrics["reaction_accuracy"]) / baseline_metrics["reaction_accuracy"]

        # Memory accuracy drift
        memory_diff = 0
        if baseline_metrics.get("memory_accuracy", 0) > 0:
            memory_diff = abs(current_metrics["memory_accuracy"] - baseline_metrics["memory_accuracy"]) / baseline_metrics["memory_accuracy"]

        # Weighted average
        drift = min(1.0, (reaction_diff * 0.4 + accuracy_diff * 0.3 + memory_diff * 0.3))

        return round(drift * 100, 2)

    @staticmethod
    def calculate_visual_drift(current_metrics: Dict, baseline_metrics: Dict) -> float:
        """
        Calculate visual-motor drift score (0-100)

        Args:
            current_metrics: Current week's visual metrics
            baseline_metrics: Baseline visual metrics

        Returns:
            Drift score (0 = no change, 100 = maximum change)
        """
        if not baseline_metrics:
            return 0.0

        # Blink frequency drift
        blink_diff = 0
        if baseline_metrics.get("blink_frequency", 0) > 0:
            blink_diff = abs(current_metrics["blink_frequency"] - baseline_metrics["blink_frequency"]) / baseline_metrics["blink_frequency"]

        # Smooth pursuit accuracy drift
        pursuit_diff = 0
        if baseline_metrics.get("smooth_pursuit_accuracy", 0) > 0:
            pursuit_diff = abs(current_metrics["smooth_pursuit_accuracy"] - baseline_metrics["smooth_pursuit_accuracy"]) / baseline_metrics["smooth_pursuit_accuracy"]

        # Weighted average
        drift = min(1.0, (blink_diff * 0.4 + pursuit_diff * 0.6))

        return round(drift * 100, 2)

    @staticmethod
    def calculate_neuro_load_score(
        speech_drift: float,
        cognitive_drift: float,
        visual_drift: float
    ) -> float:
        """
        Calculate combined Neuro Load Score (0-100)

        Args:
            speech_drift: Speech drift score (0-100)
            cognitive_drift: Cognitive drift score (0-100)
            visual_drift: Visual drift score (0-100)

        Returns:
            Neuro Load Score (0 = stable, 100 = maximum drift)
        """
        neuro_load = (
            speech_drift * settings.SPEECH_WEIGHT +
            cognitive_drift * settings.COGNITIVE_WEIGHT +
            visual_drift * settings.VISUAL_WEIGHT
        )

        return round(neuro_load, 2)

    @staticmethod
    def generate_insights(
        neuro_load_score: float,
        speech_drift: float,
        cognitive_drift: float,
        visual_drift: float
    ) -> Dict:
        """
        Generate insights and recommendations based on scores

        Args:
            neuro_load_score: Overall Neuro Load Score
            speech_drift: Speech drift score
            cognitive_drift: Cognitive drift score
            visual_drift: Visual drift score

        Returns:
            Dictionary containing insights and recommendations
        """
        # Determine overall status
        if neuro_load_score < 15:
            status = "Stable"
            status_color = "green"
            message = "Your cognitive performance is stable. Continue your current routine."
        elif neuro_load_score < 35:
            status = "Minor Changes"
            status_color = "yellow"
            message = "Some minor changes detected. Monitor your recovery and stress levels."
        elif neuro_load_score < 60:
            status = "Moderate Changes"
            status_color = "orange"
            message = "Moderate changes in performance. Consider extra recovery time."
        else:
            status = "Significant Changes"
            status_color = "red"
            message = "Significant changes detected. Prioritize rest and consult your coach."

        # Identify primary area of change
        drifts = {
            "speech": speech_drift,
            "cognitive": cognitive_drift,
            "visual": visual_drift
        }
        primary_area = max(drifts, key=drifts.get)

        area_messages = {
            "speech": "Speech patterns show the most change. This may indicate fatigue or stress affecting verbal fluency.",
            "cognitive": "Cognitive performance shows the most change. Consider if you're getting adequate rest.",
            "visual": "Visual-motor coordination shows the most change. This may relate to reaction time and tracking ability."
        }

        return {
            "status": status,
            "status_color": status_color,
            "message": message,
            "primary_area": primary_area,
            "area_message": area_messages[primary_area],
            "scores": {
                "neuro_load": neuro_load_score,
                "speech_drift": speech_drift,
                "cognitive_drift": cognitive_drift,
                "visual_drift": visual_drift
            }
        }

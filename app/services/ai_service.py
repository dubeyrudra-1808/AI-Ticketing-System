import google.generativeai as genai
import json
import re
import asyncio
import logging
from app.config import settings

logger = logging.getLogger(__name__)


class AIService:
    def __init__(self):
        self.model_name = getattr(settings, "gemini_model_name", "gemini-2.0-flash-lite-preview-02-05")
        if settings.gemini_api_key:
            genai.configure(api_key=settings.gemini_api_key)
            self.model = genai.GenerativeModel(self.model_name)
        else:
            logger.error("❌ Gemini API key not found.")
            self.model = None

        self.allowed_priorities = {"low", "medium", "high", "urgent"}
        self.allowed_ticket_types = {"bug", "feature", "support", "technical", "other"}

    async def analyze_ticket(self, title: str, description: str) -> dict:
        if not self.model:
            return self._fallback_analysis()

        prompt = f"""
You are an AI ticket triage assistant.

Analyze the ticket and reply ONLY in JSON format (no explanation).

Title: {title}
Description: {description}

Respond like this:
{{
  "required_skills": ["list", "of", "skills"],
  "priority": "low|medium|high|urgent",
  "ticket_type": "bug|feature|support|technical|other",
  "helpful_notes": "short guidance for the moderator"
}}
"""

        try:
            loop = asyncio.get_event_loop()
            response = await asyncio.wait_for(
                loop.run_in_executor(None, lambda: self.model.generate_content(prompt)),
                timeout=60
            )

            # Step 1: Extract clean text
            try:
                response_text = response.parts[0].text.strip()
                logger.debug(f"🧪 RAW GEMINI: {response_text}")
                # Clean markdown if present
                if response_text.startswith("```json"):
                    response_text = response_text.replace("```json", "").replace("```", "").strip()
                elif response_text.startswith("```"):
                    response_text = response_text.replace("```", "").strip()
            except Exception as e:
                logger.error(f"Error accessing Gemini response text: {e}")
                return self._fallback_analysis()

            # Step 2: Extract JSON
            try:
                json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
                if not json_match:
                    raise ValueError("No JSON found in response")
                json_str = json_match.group()
                logger.debug(f"🎯 Extracted JSON: {json_str}")
                data = json.loads(json_str)
            except Exception as e:
                logger.warning(f"❌ JSON parse failed: {e}")
                return self._fallback_analysis()

            # Step 3: Validate structure
            if data.get("priority") not in self.allowed_priorities:
                logger.warning(f"⚠️ Invalid priority: {data.get('priority')}")
                data["priority"] = "medium"

            if data.get("ticket_type") not in self.allowed_ticket_types:
                logger.warning(f"⚠️ Invalid ticket_type: {data.get('ticket_type')}")
                data["ticket_type"] = "support"

            if not isinstance(data.get("required_skills"), list):
                logger.warning(f"⚠️ Invalid skills format: {data.get('required_skills')}")
                data["required_skills"] = ["general"]

            return data

        except asyncio.TimeoutError:
            logger.error("⏱️ Gemini timed out.")
            return self._fallback_analysis()
        except Exception as e:
            logger.error(f"💥 Unexpected AI error: {e}")
            return self._fallback_analysis()

    def _fallback_analysis(self):
        logger.warning("⚠️ Using fallback analysis.")
        return {
            "required_skills": ["general"],
            "priority": "medium",
            "ticket_type": "support",
            "helpful_notes": "AI analysis unavailable. Please review manually."
        }


ai_service = AIService()

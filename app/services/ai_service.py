import google.generativeai as genai
from app.config import settings
import json
import re
import asyncio
import logging

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        self.model_name = getattr(settings, "gemini_model_name", "gemini-1.5-flash")
        if settings.gemini_api_key:
            genai.configure(api_key=settings.gemini_api_key)
            self.model = genai.GenerativeModel(self.model_name)
        else:
            self.model = None
        
        # Allowed values for validation
        self.allowed_priorities = {"low", "medium", "high", "urgent"}
        self.allowed_ticket_types = {"bug", "feature", "support", "technical", "other"}
    
    async def analyze_ticket(self, title: str, description: str) -> dict:
        """Analyze ticket and return AI-generated insights"""
        if not self.model:
            return self._fallback_analysis()
        
        prompt = f"""
        Analyze this support ticket and provide structured information:

        Title: {title}
        Description: {description}

        Please provide the following in JSON format:
        {{
            "required_skills": ["list", "of", "skills", "needed"],
            "priority": "low|medium|high|urgent",
            "ticket_type": "bug|feature|support|technical|other",
            "helpful_notes": "Detailed notes for the moderator about this ticket"
        }}

        Base your analysis on:
        - Technical complexity
        - User impact
        - Urgency indicators
        - Required expertise
        """

        try:
            loop = asyncio.get_event_loop()
            # Timeout for AI response, e.g., 10 seconds
            response = await asyncio.wait_for(
                loop.run_in_executor(
                    None,
                    lambda: self.model.generate_content(prompt)
                ),
                timeout=10
            )
            
            # Use non-greedy regex to extract JSON
            json_match = re.search(r'\{.*?\}', response.text, re.DOTALL)
            if json_match:
                json_str = json_match.group()
                data = json.loads(json_str)
                # Validate priority
                if data.get("priority") not in self.allowed_priorities:
                    logger.warning(f"Invalid priority '{data.get('priority')}', using fallback")
                    data["priority"] = "medium"
                # Validate ticket_type
                if data.get("ticket_type") not in self.allowed_ticket_types:
                    logger.warning(f"Invalid ticket_type '{data.get('ticket_type')}', using fallback")
                    data["ticket_type"] = "support"
                # Validate required_skills as list of strings
                if not isinstance(data.get("required_skills"), list):
                    logger.warning("Invalid required_skills, using fallback")
                    data["required_skills"] = ["general"]
                return data
            
            logger.warning("No valid JSON found in AI response, using fallback")
            return self._fallback_analysis()
        
        except asyncio.TimeoutError:
            logger.error("AI analysis timed out")
            return self._fallback_analysis()
        except Exception as e:
            logger.error(f"AI analysis error: {e}")
            return self._fallback_analysis()
    
    def _fallback_analysis(self):
        """Fallback analysis when AI is not available"""
        return {
            "required_skills": ["general"],
            "priority": "medium",
            "ticket_type": "support",
            "helpful_notes": "AI analysis unavailable. Please review manually."
        }

ai_service = AIService()


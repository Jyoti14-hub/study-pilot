import json
import os
import uuid
from typing import Any, Dict, List, Optional
from google import genai
from google.genai import types

# System prompt defining StudyPilot's beginner-friendly academic tutor persona
STUDY_PILOT_SYSTEM_INSTRUCTION = """You are StudyPilot, an empathetic, clear, and encouraging AI academic tutor for college students.
Your mission is to help students understand challenging technical concepts in simple, natural language, even if they are learning a topic for the very first time.

Follow these pedagogical principles in every response:

1. Simplify Explanations:
   - Assume the student is a beginner unless they indicate otherwise.
   - Use simple, conversational English with short, clear sentences. Avoid unnecessary jargon, complex vocabulary, and long walls of text.
   - Explain the core concept first before introducing technical details or formulas.
   - Define every technical term or acronym the first time it appears (e.g., "BJT stands for Bipolar Junction Transistor").
   - Use practical examples and relatable everyday analogies when they genuinely aid understanding (e.g., a water faucet or valve). Clearly state that the analogy is a mental model, not the actual physics.

2. Make Formulas Easy to Understand:
   - Never present a formula without explaining what it means and why it is useful.
   - Write formulas in simple, readable text first (e.g., "Collector current = Current gain × Base current"), followed by standard notation (e.g., "Ic = β × Ib").
   - Explicitly define every symbol, abbreviation, and Greek letter before or right after using it:
     * Explain what the letter stands for
     * What physical quantity it represents
     * What standard units are used (e.g., Amperes, Volts, Ohms)
   - When a formula is introduced, ALWAYS walk through a simple numerical example step by step with easy numbers. Show the calculation clearly and state the final answer with units in plain English.

3. Natural & Adaptive Teaching Structure:
   When explaining a new concept from scratch, naturally organize your explanation:
   1. What it is (simple definition)
   2. How it works (plain-language mechanism)
   3. A practical example or analogy
   4. The formula and a step-by-step numerical example (if relevant)
   5. A brief summary takeaway
   Do NOT force this structure rigidly on every prompt. Adapt directly to what the student asked:
   - If they ask for a specific definition, answer that directly first.
   - If they say they do not understand, DO NOT repeat the previous explanation. Explain it from a completely different angle with a fresh, simpler example.

4. Concise, Interactive & Focused:
   - Answer the student's specific question directly.
   - Avoid repeating the same point across different headings.
   - Do not overwhelm beginners with advanced graduate-level theory unless specifically requested.
   - End with at most ONE short, friendly follow-up question to check understanding or suggest a logical next step.

5. Technical Accuracy:
   - Keep all explanations scientifically and mathematically accurate. Simplify the language and presentation, never the underlying correctness.
"""

# Active models to try in order of preference
MODEL_CANDIDATES = [
    os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite"),
    "gemini-3.8-flash",
    "gemini-2.5-flash-lite",
]


def get_gemini_client() -> genai.Client:
    """Initialize and return the Google GenAI client without logging secrets."""
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not configured in backend/.env")
    return genai.Client(api_key=api_key)


def _call_gemini_with_fallback(client: genai.Client, contents: Any, config: Optional[types.GenerateContentConfig] = None) -> str:
    """Call Gemini with model fallback if a specific model candidate returns 404."""
    last_error = None
    for model_name in MODEL_CANDIDATES:
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=contents,
                config=config,
            )
            if response and response.text:
                return response.text
        except Exception as e:
            last_error = e
            error_str = str(e)
            if "404" in error_str or "NOT_FOUND" in error_str or "not available" in error_str:
                continue
            raise e
    if last_error:
        raise last_error
    raise RuntimeError("No response returned by Gemini provider")


def _format_conversation_history(history: Optional[List[Dict[str, Any]]], current_message: str) -> List[types.Content]:
    """Build clean alternating user/model conversation turns for Gemini."""
    contents: List[types.Content] = []
    if history:
        for msg in history[-8:]:  # Keep recent turns
            role = msg.get("role")
            content = (msg.get("content") or "").strip()
            if not content or msg.get("isDemo"):
                continue
            gemini_role = "user" if role == "user" else "model"
            if contents and contents[-1].role == gemini_role:
                # Merge consecutive messages from same role to maintain strict alternation
                contents[-1].parts[0].text += f"\n\n{content}"
            else:
                contents.append(types.Content(role=gemini_role, parts=[types.Part.from_text(text=content)]))

    # Append current message as user turn
    if contents and contents[-1].role == "user":
        contents[-1].parts[0].text += f"\n\n{current_message}"
    else:
        contents.append(types.Content(role="user", parts=[types.Part.from_text(text=current_message)]))

    # Gemini requires conversation to begin with a user turn
    while contents and contents[0].role != "user":
        contents.pop(0)

    return contents


def generate_chat_explanation(message: str, history: Optional[List[Dict[str, Any]]] = None) -> str:
    """Generate a student-friendly AI explanation using Gemini."""
    client = get_gemini_client()
    contents = _format_conversation_history(history, message)

    config = types.GenerateContentConfig(
        system_instruction=STUDY_PILOT_SYSTEM_INSTRUCTION,
        temperature=0.35,
        max_output_tokens=1024,
    )

    return _call_gemini_with_fallback(client, contents, config)


def generate_study_plan_ai(tasks: List[Dict[str, Any]], available_minutes: int) -> Dict[str, Any]:
    """Generate an AI-optimized study schedule from tasks and daily available minutes."""
    client = get_gemini_client()

    prompt = f"""You are StudyPilot's academic planner. Create an optimized study schedule for a college student.
Available study time per day: {available_minutes} minutes.
Maximum session length per block: 90 minutes.

Current tasks to schedule:
{json.dumps(tasks, indent=2)}

Return a strict JSON object with this exact schema:
{{
  "blocks": [
    {{
      "day": "Today", // or "Tomorrow", "Day 3", etc.
      "taskTitle": "task title",
      "subject": "subject name",
      "minutes": 60,
      "priority": "high" // "high" | "medium" | "low"
    }}
  ],
  "explanation": "A strategic explanation of why this schedule prioritizes high-impact and urgent tasks, and how breaks/cognitive load are managed."
}}
Return ONLY valid JSON. No surrounding markdown formatting or backticks.
"""

    config = types.GenerateContentConfig(
        temperature=0.2,
        response_mime_type="application/json",
    )

    raw_text = _call_gemini_with_fallback(client, prompt, config)
    cleaned = raw_text.strip()
    if cleaned.startswith("```json"):
        cleaned = cleaned[7:]
    if cleaned.startswith("```"):
        cleaned = cleaned[3:]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]
    return json.loads(cleaned.strip())


def generate_quiz_ai(subject: str, count: int = 6) -> List[Dict[str, Any]]:
    """Generate real educational multiple-choice quiz questions using Gemini."""
    client = get_gemini_client()

    prompt = f"""You are StudyPilot's quiz generator. Generate {count} high-quality, conceptual multiple-choice quiz questions for a university student.
Subject: "{subject}".

Return a strict JSON list of questions with this exact structure:
[
  {{
    "id": "quiz-1",
    "subject": "{subject}",
    "question": "Question text here?",
    "choices": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 1, // integer index (0 to 3) pointing to the correct choice
    "explanation": "Clear educational explanation of why the correct choice is right and common pitfalls to avoid."
  }}
]
Return ONLY valid JSON. No surrounding markdown formatting or backticks.
"""

    config = types.GenerateContentConfig(
        temperature=0.3,
        response_mime_type="application/json",
    )

    raw_text = _call_gemini_with_fallback(client, prompt, config)
    cleaned = raw_text.strip()
    if cleaned.startswith("```json"):
        cleaned = cleaned[7:]
    if cleaned.startswith("```"):
        cleaned = cleaned[3:]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]

    questions = json.loads(cleaned.strip())
    for idx, q in enumerate(questions):
        if not q.get("id"):
            q["id"] = f"ai-quiz-{idx}-{str(uuid.uuid4())[:8]}"
        if not q.get("subject"):
            q["subject"] = subject
    return questions

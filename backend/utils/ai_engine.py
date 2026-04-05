import json
import os
import re

from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

# gemini-1.5-flash is no longer available on the current Gemini API; use a
# supported Flash model. Override with GEMINI_MODEL in .env if needed.
MODEL_NAME = os.getenv("GEMINI_MODEL", "gemini-3.1-flash-lite-preview")
# MODEL_NAME = os.getenv("GEMINI_MODEL", "gemini-3-flash-preview")
# MODEL_NAME = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")


def _get_client():
    key = os.getenv("GEMINI_API_KEY")
    if not key:
        raise ValueError("GEMINI_API_KEY environment variable not set")
    return genai.Client(api_key=key)


def _response_text(response):
    if not response:
        return ""
    t = getattr(response, "text", None)
    if t:
        return t
    candidates = getattr(response, "candidates", None) or []
    if not candidates:
        return ""
    c0 = candidates[0]
    content = getattr(c0, "content", None)
    parts = getattr(content, "parts", None) if content else None
    if not parts:
        return ""
    p0 = parts[0]
    return getattr(p0, "text", None) or str(p0)


def _parse_json_from_text(text):
    if not text:
        raise ValueError("empty response")
    s = text.strip()
    if s.startswith("```"):
        s = re.sub(r"^```(?:json)?\s*", "", s, flags=re.IGNORECASE)
        s = re.sub(r"\s*```\s*$", "", s)
    return json.loads(s)


def _generate_json(system_instruction, user_prompt):
    client = _get_client()
    config_json = types.GenerateContentConfig(
        system_instruction=system_instruction,
        response_mime_type="application/json",
    )
    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=user_prompt,
            config=config_json,
        )
        raw = _response_text(response)
    except Exception:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=user_prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
            ),
        )
        raw = _response_text(response)
    try:
        return _parse_json_from_text(raw)
    except (json.JSONDecodeError, ValueError):
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=user_prompt
            + "\n\nRemember: respond with valid JSON only, no markdown fences.",
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
            ),
        )
        return _parse_json_from_text(_response_text(response))


def generate_roadmap(topic, level):
    system = (
        "You are an expert curriculum designer. Generate a structured "
        "learning roadmap. Always respond in valid JSON only. No markdown, "
        "no explanation, just pure JSON."
    )
    user = f"""Create a learning roadmap for topic: {topic} at level: {level}
Return ONLY this JSON structure, nothing else:
{{
  "chapter_count": <number between 5 and 8>,
  "chapters": [
    {{
      "chapter_number": 1,
      "title": "<string>",
      "description": "<string of 2-3 sentences>",
      "reading_time": "<string like 15 mins>",
      "difficulty": "Beginner" or "Intermediate" or "Advanced",
      "key_concepts": ["<3-5 strings>"]
    }}
  ]
}}"""
    return _generate_json(system, user)


def generate_chapter_blog(
    topic, level, chapter_number, chapter_title, chapter_description, key_concepts
):
    system = (
        "You are an expert technical writer and educator. Write detailed, "
        "engaging blog-style educational content. Use markdown formatting."
    )
    concepts = (
        json.dumps(key_concepts)
        if isinstance(key_concepts, (list, dict))
        else str(key_concepts)
    )
    user = f"""Write a comprehensive blog article for:
Topic: {topic}
Level: {level}
Chapter {chapter_number}: {chapter_title}
Description: {chapter_description}
Key Concepts to Cover: {concepts}

Requirements:
- Minimum 600 words
- Use markdown with ## for subheadings
- Start with an engaging introduction
- Include real world examples and analogies
- Add code snippets in code blocks if topic is technical
- End with ## Key Takeaways section (bullet points)
- End with ## What is Next section (1 paragraph teaser)
- Write in simple conversational English
- No external links
- All content must be self-contained"""
    client = _get_client()
    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=user,
        config=types.GenerateContentConfig(system_instruction=system),
    )
    return (_response_text(response) or "").strip()


def generate_quiz(topic, chapter_number, chapter_title, chapter_content):
    system = (
        "You are an expert educator. Generate quiz questions based on the "
        "chapter content. Always respond in valid JSON only."
    )
    snippet = (chapter_content or "")[:1000]
    user = f"""Generate a quiz for:
Topic: {topic}
Chapter {chapter_number}: {chapter_title}
Based on this content: {snippet}

Return ONLY this JSON structure:
{{
  "questions": [
    {{
      "question": "<string>",
      "options": {{
        "A": "<string>",
        "B": "<string>",
        "C": "<string>",
        "D": "<string>"
      }},
      "correct_answer": "A" or "B" or "C" or "D",
      "explanation": "<string one sentence>"
    }}
  ]
}}
Generate exactly 5 questions."""
    data = _generate_json(system, user)
    qs = data.get("questions") or []
    if len(qs) > 5:
        qs = qs[:5]
    data["questions"] = qs
    return data


def generate_midterm_exam(topic, level, chapters_covered):
    system = (
        "You are an expert educator. Generate exam content. "
        "Always respond in valid JSON only."
    )
    user = f"""Generate a midterm exam for:
Topic: {topic} at {level} level
Chapters covered: {json.dumps(chapters_covered)}

Return ONLY this JSON:
{{
  "mcq_questions": [<10 MCQ objects with question, options A-D, correct_answer, explanation>],
  "short_questions": [
    {{ "question": "<string>", "expected_answer": "<string>", "marks": 5 }},
    {{ "question": "<string>", "expected_answer": "<string>", "marks": 5 }}
  ],
  "practical_task": {{
    "question": "<string>",
    "description": "<string>",
    "marks": 10
  }},
  "total_marks": 30,
  "pass_marks": 20
}}"""
    return _generate_json(system, user)


def generate_final_exam(topic, level, all_chapters):
    system = (
        "You are an expert educator. Generate exam content. "
        "Always respond in valid JSON only."
    )
    user = f"""Generate a final comprehensive exam for:
Topic: {topic} at {level} level
All Chapters: {json.dumps(all_chapters)}

Return ONLY this JSON:
{{
  "mcq_questions": [<15 MCQ objects with question, options A-D, correct_answer, explanation>],
  "short_questions": [
    {{ "question": "<string>", "expected_answer": "<string>", "marks": 5 }},
    {{ "question": "<string>", "expected_answer": "<string>", "marks": 5 }},
    {{ "question": "<string>", "expected_answer": "<string>", "marks": 5 }}
  ],
  "capstone_project": {{
    "title": "<string>",
    "problem_statement": "<string>",
    "requirements": ["<4-5 strings>"],
    "evaluation_criteria": ["<3-4 strings>"],
    "marks": 20
  }},
  "total_marks": 50,
  "pass_marks": 35
}}"""
    return _generate_json(system, user)


def chat_with_ai(topic, context, conversation_history, user_message):
    system = (
        f"You are a helpful learning assistant for the topic: {topic}. "
        f"The student is currently studying this content:\n{context}\n"
        "Answer their questions clearly and concisely. Keep responses "
        "under 150 words unless a detailed explanation is needed."
    )
    client = _get_client()
    contents = []
    for msg in conversation_history or []:
        role = (msg.get("role") or "").lower()
        content = (msg.get("content") or "").strip()
        if not content:
            continue
        if role == "user":
            contents.append(
                types.UserContent(parts=[types.Part.from_text(text=content)])
            )
        elif role in ("assistant", "model"):
            contents.append(
                types.ModelContent(parts=[types.Part.from_text(text=content)])
            )
    contents.append(
        types.UserContent(parts=[types.Part.from_text(text=user_message)])
    )
    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=contents,
        config=types.GenerateContentConfig(system_instruction=system),
    )
    return (_response_text(response) or "").strip()


def _stream_text_deltas(stream):
    """Yield text increments whether the API sends cumulative or per-chunk deltas."""
    seen = ""
    for chunk in stream:
        text = getattr(chunk, "text", None) or ""
        if not text:
            continue
        if text.startswith(seen):
            delta = text[len(seen) :]
            seen = text
        else:
            delta = text
            seen = seen + text
        if delta:
            yield delta


def chat_with_ai_stream(topic, context, conversation_history, user_message):
    system = (
        f"You are a helpful learning assistant for the topic: {topic}. "
        f"The student is currently studying this content:\n{context}\n"
        "Answer their questions clearly and concisely. Keep responses "
        "under 150 words unless a detailed explanation is needed."
    )
    client = _get_client()
    contents = []
    for msg in conversation_history or []:
        role = (msg.get("role") or "").lower()
        content = (msg.get("content") or "").strip()
        if not content:
            continue
        if role == "user":
            contents.append(
                types.UserContent(parts=[types.Part.from_text(text=content)])
            )
        elif role in ("assistant", "model"):
            contents.append(
                types.ModelContent(parts=[types.Part.from_text(text=content)])
            )
    contents.append(
        types.UserContent(parts=[types.Part.from_text(text=user_message)])
    )
    stream = client.models.generate_content_stream(
        model=MODEL_NAME,
        contents=contents,
        config=types.GenerateContentConfig(system_instruction=system),
    )
    yield from _stream_text_deltas(stream)

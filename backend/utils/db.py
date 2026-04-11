import base64
import json
import os
from datetime import datetime

from bson import ObjectId
from bson.raw_bson import RawBSONDocument
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.collection import ReturnDocument

load_dotenv()

_mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017")
_client = MongoClient(_mongo_uri)
_db = _client["learnpath_db"]

topics_col = _db["topics"]
chapters_col = _db["chapters"]
quizzes_col = _db["quizzes"]
exams_col = _db["exams"]
results_col = _db["results"]
feedback_col = _db["feedback"]
notes_col = _db["notes"]
flashcards_col = _db["flashcards"]
analytics_col = _db["analytics"]
profiles_col = _db["profiles"]
achievements_col = _db["achievements"]


def _oid(topic_id):
    return ObjectId(topic_id) if ObjectId.is_valid(topic_id) else None


def create_topic(user_id, topic_name, level, roadmap):
    doc = {
        "user_id": user_id,
        "topic_name": topic_name,
        "level": level,
        "roadmap": roadmap,
        "created_at": datetime.utcnow(),
        "completed": False,
        "total_score": 0,
        "max_score": 0,
    }
    r = topics_col.insert_one(doc)
    return str(r.inserted_id)


def save_chapter(topic_id, chapter_number, title, content):
    doc = {
        "topic_id": topic_id,
        "chapter_number": int(chapter_number),
        "title": title,
        "content": content,
        "created_at": datetime.utcnow(),
    }
    r = chapters_col.insert_one(doc)
    return str(r.inserted_id)


def save_quiz(topic_id, chapter_number, questions):
    doc = {
        "topic_id": topic_id,
        "chapter_number": int(chapter_number),
        "questions": questions,
        "user_answers": [],
        "score": None,
        "completed": False,
        "created_at": datetime.utcnow(),
    }
    r = quizzes_col.insert_one(doc)
    return str(r.inserted_id)


def save_exam(topic_id, exam_type, exam_data):
    doc = {
        "topic_id": topic_id,
        "exam_type": exam_type,
        "mcq_questions": exam_data.get("mcq_questions", []),
        "short_questions": exam_data.get("short_questions", []),
        "user_answers": {},
        "score": None,
        "completed": False,
        "created_at": datetime.utcnow(),
        "total_marks": exam_data.get("total_marks", 30 if exam_type == "midterm" else 50),
        "pass_marks": exam_data.get("pass_marks", 20 if exam_type == "midterm" else 35),
    }
    if exam_type == "final":
        cap = exam_data.get("capstone_project")
        doc["capstone"] = cap if isinstance(cap, str) else json.dumps(cap or {})
    else:
        doc["capstone"] = ""
        doc["practical_task"] = exam_data.get("practical_task") or {}
    r = exams_col.insert_one(doc)
    return str(r.inserted_id)


def save_quiz_result(quiz_id, user_answers, score):
    oid = _oid(quiz_id)
    if not oid:
        return False
    quizzes_col.update_one(
        {"_id": oid},
        {
            "$set": {
                "user_answers": user_answers,
                "score": score,
                "completed": True,
            }
        },
    )
    return True


def save_exam_result(exam_id, user_answers, score):
    oid = _oid(exam_id)
    if not oid:
        return False
    exams_col.update_one(
        {"_id": oid},
        {
            "$set": {
                "user_answers": user_answers,
                "score": score,
                "completed": True,
            }
        },
    )
    return True


def get_user_topics(user_id):
    cur = topics_col.find({"user_id": user_id}).sort("created_at", -1)
    return list(cur)


def get_topic_full(topic_id):
    oid = _oid(topic_id)
    if not oid:
        return None
    return topics_col.find_one({"_id": oid})


def get_chapters(topic_id):
    cur = chapters_col.find({"topic_id": topic_id}).sort("chapter_number", 1)
    return list(cur)


def get_quizzes(topic_id):
    cur = quizzes_col.find({"topic_id": topic_id}).sort("chapter_number", 1)
    return list(cur)


def get_exams(topic_id):
    cur = exams_col.find({"topic_id": topic_id})
    return list(cur)


def update_topic_completion(topic_id, total_score, max_score):
    oid = _oid(topic_id)
    if not oid:
        return False
    topics_col.update_one(
        {"_id": oid},
        {
            "$set": {
                "completed": True,
                "total_score": total_score,
                "max_score": max_score,
            }
        },
    )
    return True


def get_results(topic_id):
    quizzes = list(quizzes_col.find({"topic_id": topic_id}).sort("chapter_number", 1))

    assessments = []
    total_score = 0
    max_score = 0

    for q in quizzes:
        qmax = len(q.get("questions") or [])
        if qmax == 0:
            qmax = 5
        name = f"Quiz {q.get('chapter_number', '?')}"
        if q.get("completed"):
            sc = int(q.get("score") or 0)
            assessments.append(
                {
                    "id": str(q["_id"]),
                    "name": name,
                    "type": "quiz",
                    "chapter_number": q.get("chapter_number"),
                    "score": sc,
                    "max_score": qmax,
                    "percentage": round((sc / qmax) * 100, 1) if qmax else 0,
                    "passed": sc >= max(1, int(qmax * 0.6)),
                }
            )
            total_score += sc
            max_score += qmax
        else:
            assessments.append(
                {
                    "id": str(q["_id"]),
                    "name": name,
                    "type": "quiz",
                    "chapter_number": q.get("chapter_number"),
                    "score": None,
                    "max_score": qmax,
                    "percentage": None,
                    "passed": None,
                }
            )

    percentage = round((total_score / max_score) * 100, 1) if max_score else 0.0
    all_done = len(quizzes) > 0 and all(q.get("completed") for q in quizzes)

    return {
        "assessments": assessments,
        "total_score": total_score,
        "max_score": max_score,
        "percentage": percentage,
        "all_completed": all_done,
    }


def save_feedback(user_id, name, email, rating, feedback_type, message):
    doc = {
        "user_id": user_id,
        "name": name,
        "email": email,
        "rating": int(rating),
        "feedback_type": feedback_type,
        "message": message,
        "created_at": datetime.utcnow(),
    }
    r = feedback_col.insert_one(doc)
    return str(r.inserted_id)


def get_all_feedback():
    feedback_list = list(feedback_col.find().sort("created_at", -1))
    for fb in feedback_list:
        fb["_id"] = str(fb["_id"])
    return feedback_list


def save_note(user_id, topic_id, chapter_number, selected_text, note_text, highlight_color):
    doc = {
        "user_id": user_id,
        "topic_id": topic_id,
        "chapter_number": chapter_number,
        "selected_text": selected_text,
        "note_text": note_text,
        "highlight_color": highlight_color,
        "created_at": datetime.utcnow(),
    }
    r = notes_col.insert_one(doc)
    return str(r.inserted_id)


def get_user_notes(user_id, topic_id):
    cur = notes_col.find({"user_id": user_id, "topic_id": topic_id}).sort("created_at", -1)
    notes = list(cur)
    for n in notes:
        n["_id"] = str(n["_id"])
    return notes


def _decode_avatar_data(avatar_data):
    if not isinstance(avatar_data, str) or "," not in avatar_data:
        return None
    try:
        _, encoded = avatar_data.split(",", 1)
        return base64.b64decode(encoded, validate=True)
    except Exception:
        return None


def get_user_profile(user_id):
    profile = profiles_col.find_one({"user_id": user_id}) or {}
    if profile.get("_id"):
        profile["_id"] = str(profile["_id"])
    return profile


def save_user_profile(user_id, full_name, username, bio, avatar_data=None, avatar_url=None):
    if avatar_data:
        decoded = _decode_avatar_data(avatar_data)
        if decoded is None:
            raise ValueError("Invalid avatar image data")
        if len(decoded) > 1024 * 1024:
            raise ValueError("Avatar image exceeds maximum size of 1MB")
    now = datetime.utcnow()
    update_payload = {
        "full_name": full_name,
        "username": username,
        "bio": bio,
        "avatar_data": avatar_data if avatar_data else None,
        "avatar_url": avatar_url if avatar_url else None,
        "updated_at": now,
    }
    profile = profiles_col.find_one_and_update(
        {"user_id": user_id},
        {
            "$set": update_payload,
            "$setOnInsert": {"created_at": now},
        },
        upsert=True,
        return_document=ReturnDocument.AFTER,
    )
    if profile.get("_id"):
        profile["_id"] = str(profile["_id"])
    return profile


def delete_topic(topic_id, user_id=None):
    oid = _oid(topic_id)
    if not oid:
        return False
    query = {"_id": oid}
    if user_id:
        query["user_id"] = user_id

    result = topics_col.delete_one(query)
    if result.deleted_count == 0:
        return False

    chapters_col.delete_many({"topic_id": topic_id})
    quizzes_col.delete_many({"topic_id": topic_id})
    exams_col.delete_many({"topic_id": topic_id})
    results_col.delete_many({"topic_id": topic_id})
    notes_col.delete_many({"topic_id": topic_id})
    flashcards_col.delete_many({"topic_id": topic_id})
    return True


def update_note(note_id, note_text):
    oid = _oid(note_id)
    if not oid:
        return False
    notes_col.update_one(
        {"_id": oid},
        {"$set": {"note_text": note_text, "updated_at": datetime.utcnow()}}
    )
    return True


def delete_note(note_id):
    oid = _oid(note_id)
    if not oid:
        return False
    notes_col.delete_one({"_id": oid})
    return True


def save_flashcards(user_id, topic_id, chapter_number, flashcards):
    doc = {
        "user_id": user_id,
        "topic_id": topic_id,
        "chapter_number": chapter_number,
        "flashcards": flashcards,
        "created_at": datetime.utcnow(),
    }
    r = flashcards_col.insert_one(doc)
    return str(r.inserted_id)


def get_flashcards(user_id, topic_id):
    cur = flashcards_col.find({"user_id": user_id, "topic_id": topic_id}).sort("chapter_number", 1)
    cards = list(cur)
    for c in cards:
        c["_id"] = str(c["_id"])
    return cards


def update_study_time(user_id, topic_id, time_spent):
    now = datetime.utcnow()
    analytics = analytics_col.find_one({"user_id": user_id, "topic_id": topic_id})
    streak = 1
    if analytics:
        last_studied_at = analytics.get("last_studied_at")
        if isinstance(last_studied_at, datetime):
            delta_days = (now.date() - last_studied_at.date()).days
            if delta_days == 1:
                streak = (analytics.get("streak", 0) or 0) + 1
            elif delta_days == 0:
                streak = analytics.get("streak", 1) or 1
            else:
                streak = 1
        else:
            streak = (analytics.get("streak", 0) or 0) + 1

        analytics_col.update_one(
            {"user_id": user_id, "topic_id": topic_id},
            {
                "$inc": {"total_time": time_spent},
                "$set": {
                    "last_studied_at": now,
                    "last_updated": now,
                    "streak": streak,
                },
            },
            upsert=True,
        )
    else:
        analytics_col.insert_one(
            {
                "user_id": user_id,
                "topic_id": topic_id,
                "total_time": time_spent,
                "streak": 1,
                "created_at": now,
                "last_studied_at": now,
                "last_updated": now,
            }
        )


def get_topic_analytics(user_id, topic_id):
    analytics = analytics_col.find_one({"user_id": user_id, "topic_id": topic_id}) or {}
    total_time = analytics.get("total_time", 0)
    streak = analytics.get("streak", 0)
    last_studied_at = analytics.get("last_studied_at")
    last_studied_at = last_studied_at.isoformat() if isinstance(last_studied_at, datetime) else last_studied_at

    chapters = list(chapters_col.find({"topic_id": topic_id}).sort("chapter_number", 1))
    quizzes = list(quizzes_col.find({"topic_id": topic_id}).sort("chapter_number", 1))

    total_chapters = len(chapters)
    completed_chapters = sum(1 for q in quizzes if q.get("completed"))
    remaining_chapters = max(total_chapters - completed_chapters, 0)

    total_score = 0
    total_max = 0
    scores = []
    for q in quizzes:
        qmax = len(q.get("questions") or [])
        if qmax == 0:
            qmax = 5
        score = int(q.get("score") or 0)
        if q.get("completed"):
            total_score += score
            total_max += qmax
        scores.append(
            {
                "chapter_number": q.get("chapter_number"),
                "score": score,
                "max": qmax,
                "percentage": round((score / qmax) * 100, 1) if qmax else 0,
                "title": next((c.get("title") for c in chapters if c.get("chapter_number") == q.get("chapter_number")), f"Chapter {q.get('chapter_number')}")
            }
        )

    average_quiz_score = round((total_score / total_max) * 100, 1) if total_max else 0

    strongest = None
    weakest = None
    scored = [s for s in scores if s.get("max") > 0]
    if scored:
        strongest = max(scored, key=lambda item: item["percentage"])
        weakest = min(scored, key=lambda item: item["percentage"])

    return {
        "total_time": total_time,
        "study_streak": streak,
        "last_studied_at": last_studied_at,
        "chapters_completed": completed_chapters,
        "chapters_remaining": remaining_chapters,
        "average_quiz_score": average_quiz_score,
        "strongest_chapter": strongest,
        "weakest_chapter": weakest,
        "total_chapters": total_chapters,
    }


def unlock_achievement(user_id, achievement_type):
    doc = {
        "user_id": user_id,
        "achievement_type": achievement_type,
        "unlocked_at": datetime.utcnow(),
    }
    r = achievements_col.insert_one(doc)
    return str(r.inserted_id)

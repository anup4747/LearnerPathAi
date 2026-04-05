import json
import os
from datetime import datetime

from bson import ObjectId
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

_mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017")
_client = MongoClient(_mongo_uri)
_db = _client["learnpath_db"]

topics_col = _db["topics"]
chapters_col = _db["chapters"]
quizzes_col = _db["quizzes"]
exams_col = _db["exams"]
results_col = _db["results"]


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

import json
import os
from datetime import datetime

from bson import ObjectId
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_socketio import SocketIO, emit

from utils import ai_engine, db
from utils.ai_engine import chat_with_ai, chat_with_ai_stream
from utils.content_generator import get_generation_status, start_generation_thread

load_dotenv()

app = Flask(__name__)
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "change-me-in-production")
JWTManager(app)

CORS(
    app,
    resources={
        r"/api/*": {
            "origins": [
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "http://localhost:4173",
                "http://127.0.0.1:4173",
            ],
            "methods": ["GET", "POST", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
        }
    },
)

socketio = SocketIO(
    app,
    cors_allowed_origins=[
        "http://127.0.0.1:5173",
        "http://localhost:5173",
        "http://127.0.0.1:4173",
        "http://localhost:4173",
    ],
    async_mode="threading",
)


def serialize_doc(obj):
    if obj is None:
        return None
    if isinstance(obj, ObjectId):
        return str(obj)
    if isinstance(obj, datetime):
        return obj.isoformat()
    if isinstance(obj, dict):
        return {k: serialize_doc(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [serialize_doc(i) for i in obj]
    return obj


def _run_chat_stream(sid, topic, context, history, message):
    try:
        for delta in chat_with_ai_stream(topic, context, history, message):
            if delta:
                socketio.emit("chat_delta", {"text": delta}, room=sid)
        socketio.emit("chat_done", {}, room=sid)
    except Exception as exc:
        socketio.emit("chat_error", {"error": str(exc)}, room=sid)


@socketio.on("chat_stream")
def ws_chat_stream(data):
    sid = request.sid
    if not isinstance(data, dict):
        emit("chat_error", {"error": "Invalid payload"})
        return
    message = data.get("message")
    if not message:
        emit("chat_error", {"error": "message is required"})
        return
    topic = data.get("topic") or ""
    context = data.get("context") or ""
    history = data.get("conversation_history") or []
    socketio.start_background_task(_run_chat_stream, sid, topic, context, history, message)


@app.route("/api/topics/create", methods=["POST"])
def api_topics_create():
    data = request.get_json() or {}
    user_id = data.get("user_id")
    topic_name = data.get("topic_name")
    level = data.get("level")
    if not user_id or not topic_name or not level:
        return jsonify({"error": "user_id, topic_name, and level are required"}), 400
    try:
        roadmap_data = ai_engine.generate_roadmap(topic_name, level)
    except Exception as exc:
        return jsonify({"error": f"Failed to generate roadmap: {exc!s}"}), 500
    chapters = roadmap_data.get("chapters") or []
    try:
        topic_id = db.create_topic(user_id, topic_name, level, chapters)
    except Exception as exc:
        return jsonify({"error": f"Database error: {exc!s}"}), 500
    start_generation_thread(topic_id, topic_name, level)
    return jsonify(
        serialize_doc(
            {
                "topic_id": topic_id,
                "roadmap": roadmap_data,
            }
        )
    ), 200


@app.route("/api/topics/status/<topic_id>", methods=["GET"])
def api_topics_status(topic_id):
    status = get_generation_status(topic_id)
    return jsonify({"status": status}), 200


@app.route("/api/topics/<user_id>", methods=["GET"])
def api_topics_user(user_id):
    try:
        topics = db.get_user_topics(user_id)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500
    return jsonify(serialize_doc(topics)), 200


@app.route("/api/topic/<topic_id>", methods=["GET"])
def api_topic_one(topic_id):
    doc = db.get_topic_full(topic_id)
    if not doc:
        return jsonify({"error": "Topic not found"}), 404
    return jsonify(serialize_doc(doc)), 200


@app.route("/api/chapters/<topic_id>", methods=["GET"])
def api_chapters(topic_id):
    try:
        rows = db.get_chapters(topic_id)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500
    return jsonify(serialize_doc(rows)), 200


@app.route("/api/quizzes/<topic_id>", methods=["GET"])
def api_quizzes(topic_id):
    try:
        rows = db.get_quizzes(topic_id)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500
    return jsonify(serialize_doc(rows)), 200


@app.route("/api/exams/<topic_id>", methods=["GET"])
def api_exams(topic_id):
    try:
        rows = db.get_exams(topic_id)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500
    out = []
    for r in rows:
        s = serialize_doc(r)
        if s.get("capstone") and isinstance(s["capstone"], str):
            try:
                s["capstone_parsed"] = json.loads(s["capstone"])
            except json.JSONDecodeError:
                s["capstone_parsed"] = s["capstone"]
        out.append(s)
    return jsonify(out), 200


@app.route("/api/quiz/submit", methods=["POST"])
def api_quiz_submit():
    data = request.get_json() or {}
    quiz_id = data.get("quiz_id")
    user_answers = data.get("user_answers")
    score = data.get("score")
    if quiz_id is None or user_answers is None or score is None:
        return jsonify({"error": "quiz_id, user_answers, and score are required"}), 400
    try:
        ok = db.save_quiz_result(quiz_id, user_answers, score)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500
    if not ok:
        return jsonify({"error": "Quiz not found"}), 404
    return jsonify({"success": True}), 200


@app.route("/api/exam/submit", methods=["POST"])
def api_exam_submit():
    data = request.get_json() or {}
    exam_id = data.get("exam_id")
    user_answers = data.get("user_answers")
    score = data.get("score")
    if exam_id is None or user_answers is None or score is None:
        return jsonify({"error": "exam_id, user_answers, and score are required"}), 400
    try:
        ok = db.save_exam_result(exam_id, user_answers, score)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500
    if not ok:
        return jsonify({"error": "Exam not found"}), 404
    return jsonify({"success": True}), 200


@app.route("/api/results/<topic_id>", methods=["GET"])
def api_results(topic_id):
    try:
        payload = db.get_results(topic_id)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500
    return jsonify(serialize_doc(payload)), 200


@app.route("/api/chat", methods=["POST"])
def api_chat():
    data = request.get_json() or {}
    topic = data.get("topic") or ""
    context = data.get("context") or ""
    conversation_history = data.get("conversation_history") or []
    message = data.get("message")
    if not message:
        return jsonify({"error": "message is required"}), 400
    try:
        reply = chat_with_ai(topic, context, conversation_history, message)
    except Exception as exc:
        return jsonify({"error": f"Chat failed: {exc!s}"}), 500
    return jsonify({"response": reply}), 200


@app.route("/api/topic/complete", methods=["POST"])
def api_topic_complete():
    data = request.get_json() or {}
    topic_id = data.get("topic_id")
    total_score = data.get("total_score")
    max_score = data.get("max_score")
    if topic_id is None or total_score is None or max_score is None:
        return (
            jsonify({"error": "topic_id, total_score, and max_score are required"}),
            400,
        )
    try:
        ok = db.update_topic_completion(topic_id, total_score, max_score)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500
    if not ok:
        return jsonify({"error": "Topic not found"}), 404
    return jsonify({"success": True}), 200


if __name__ == "__main__":
    socketio.run(
        app,
        debug=True,
        host="127.0.0.1",
        port=5000,
        allow_unsafe_werkzeug=True,
    )

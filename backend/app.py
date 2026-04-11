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


@app.route("/api/feedback", methods=["POST"])
def api_feedback():
    data = request.get_json() or {}
    user_id = data.get("user_id")
    name = data.get("name")
    email = data.get("email")
    rating = data.get("rating")
    feedback_type = data.get("feedback_type")
    message = data.get("message")

    if not all([name, email, rating, feedback_type, message]):
        return jsonify({"error": "name, email, rating, feedback_type, and message are required"}), 400

    try:
        feedback_id = db.save_feedback(user_id, name, email, rating, feedback_type, message)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500

    return jsonify({"success": True, "feedback_id": feedback_id}), 201


@app.route("/api/notes/create", methods=["POST"])
def api_create_note():
    data = request.get_json() or {}
    user_id = data.get("user_id")
    topic_id = data.get("topic_id")
    chapter_number = data.get("chapter_number")
    selected_text = data.get("selected_text")
    note_text = data.get("note_text")
    highlight_color = data.get("highlight_color", "yellow")

    if not all([user_id, topic_id, chapter_number, selected_text, note_text]):
        return jsonify({"error": "user_id, topic_id, chapter_number, selected_text, and note_text are required"}), 400

    try:
        note_id = db.save_note(user_id, topic_id, chapter_number, selected_text, note_text, highlight_color)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500

    return jsonify({"success": True, "note_id": note_id}), 201


@app.route("/api/notes/<user_id>/<topic_id>", methods=["GET"])
def api_get_user_notes(user_id, topic_id):
    try:
        notes = db.get_user_notes(user_id, topic_id)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500

    return jsonify(notes), 200


@app.route("/api/notes/update/<note_id>", methods=["PUT"])
def api_update_note(note_id):
    data = request.get_json() or {}
    note_text = data.get("note_text")

    if not note_text:
        return jsonify({"error": "note_text is required"}), 400

    try:
        ok = db.update_note(note_id, note_text)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500

    if not ok:
        return jsonify({"error": "Note not found"}), 404

    return jsonify({"success": True}), 200


@app.route("/api/notes/delete/<note_id>", methods=["DELETE"])
def api_delete_note(note_id):
    try:
        ok = db.delete_note(note_id)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500

    if not ok:
        return jsonify({"error": "Note not found"}), 404

    return jsonify({"success": True}), 200


@app.route("/api/profile/<user_id>", methods=["GET"])
def api_get_profile(user_id):
    try:
        profile = db.get_user_profile(user_id) or {}
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500
    return jsonify(serialize_doc(profile)), 200


@app.route("/api/profile/update", methods=["POST"])
def api_update_profile():
    data = request.get_json() or {}
    user_id = data.get("user_id")
    full_name = data.get("full_name")
    username = data.get("username")
    bio = data.get("bio", "")
    avatar_data = data.get("avatar_data")
    avatar_url = data.get("avatar_url")

    if not all([user_id, full_name, username]):
        return jsonify({"error": "user_id, full_name, and username are required"}), 400

    try:
        profile = db.save_user_profile(
            user_id,
            full_name,
            username,
            bio,
            avatar_data=avatar_data,
            avatar_url=avatar_url,
        )
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500

    return jsonify({"success": True, "profile": serialize_doc(profile)}), 200


@app.route("/api/topics/delete/<topic_id>", methods=["DELETE"])
def api_delete_topic(topic_id):
    user_id = request.args.get("user_id")
    try:
        deleted = db.delete_topic(topic_id, user_id=user_id)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500
    if not deleted:
        return jsonify({"error": "Topic not found or not authorized"}), 404
    return jsonify({"success": True}), 200


@app.route("/api/analytics/study", methods=["POST"])
def api_analytics_study():
    data = request.get_json() or {}
    user_id = data.get("user_id")
    topic_id = data.get("topic_id")
    seconds = data.get("seconds")

    if not all([user_id, topic_id]) or seconds is None:
        return jsonify({"error": "user_id, topic_id, and seconds are required"}), 400

    try:
        db.update_study_time(user_id, topic_id, int(seconds))
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500

    return jsonify({"success": True}), 200


@app.route("/api/analytics/<user_id>/<topic_id>", methods=["GET"])
def api_analytics(user_id, topic_id):
    try:
        payload = db.get_topic_analytics(user_id, topic_id)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500
    return jsonify(serialize_doc(payload)), 200


@app.route("/api/flashcards/create", methods=["POST"])
def api_create_flashcards():
    data = request.get_json() or {}
    user_id = data.get("user_id")
    topic_id = data.get("topic_id")
    chapter_number = data.get("chapter_number")
    flashcards = data.get("flashcards")

    if not all([user_id, topic_id, chapter_number, flashcards]):
        return jsonify({"error": "user_id, topic_id, chapter_number, and flashcards are required"}), 400

    try:
        flashcards_id = db.save_flashcards(user_id, topic_id, chapter_number, flashcards)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500

    return jsonify({"success": True, "flashcards_id": flashcards_id}), 201


@app.route("/api/flashcards/<user_id>/<topic_id>", methods=["GET"])
def api_get_flashcards(user_id, topic_id):
    try:
        cards = db.get_flashcards(user_id, topic_id)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500

    return jsonify(cards), 200


if __name__ == "__main__":
    socketio.run(
        app,
        debug=True,
        host="127.0.0.1",
        port=5000,
        allow_unsafe_werkzeug=True,
    )

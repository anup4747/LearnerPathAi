import logging
import threading

from utils import ai_engine, db

logger = logging.getLogger(__name__)

generation_status = {}


def get_generation_status(topic_id):
    return generation_status.get(topic_id, "pending")


def generate_full_course(topic_id, topic, level):
    try:
        doc = db.get_topic_full(topic_id)
        if not doc:
            logger.error("Topic not found: %s", topic_id)
            generation_status[topic_id] = "failed"
            return
        roadmap = doc.get("roadmap") or []
        if isinstance(roadmap, dict) and "chapters" in roadmap:
            chapters = roadmap["chapters"]
        else:
            chapters = roadmap

        for ch in chapters:
            num = ch.get("chapter_number", 1)
            title = ch.get("title", f"Chapter {num}")
            desc = ch.get("description", "")
            concepts = ch.get("key_concepts", [])

            blog = ai_engine.generate_chapter_blog(
                topic, level, num, title, desc, concepts
            )
            db.save_chapter(topic_id, num, title, blog)

            quiz_data = ai_engine.generate_quiz(topic, num, title, blog)
            questions = quiz_data.get("questions") or []
            db.save_quiz(topic_id, num, questions)

        generation_status[topic_id] = "completed"
    except Exception as exc:
        logger.exception("generate_full_course failed: %s", exc)
        generation_status[topic_id] = "failed"


def start_generation_thread(topic_id, topic, level):
    generation_status[topic_id] = "generating"

    def run():
        generate_full_course(topic_id, topic, level)

    t = threading.Thread(target=run, daemon=True)
    t.start()

import os
import json
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
import aiosqlite
from config import settings

def get_db_file_path() -> str:
    db_url = settings.DATABASE_URL
    # Format e.g.: sqlite:////data/app.db or sqlite:///./app.db or sqlite:///C:/path/app.db
    prefix = "sqlite:///"
    if db_url.startswith(prefix):
        path = db_url[len(prefix):]
    else:
        path = db_url.replace("sqlite://", "")
    
    # Ensure directory exists
    dir_name = os.path.dirname(path)
    if dir_name and not os.path.exists(dir_name):
        try:
            os.makedirs(dir_name, exist_ok=True)
        except OSError:
            pass
    return path

async def init_db():
    db_path = get_db_file_path()
    async with aiosqlite.connect(db_path) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL,
                role TEXT NOT NULL,
                content TEXT NOT NULL,
                metadata TEXT,
                created_at TEXT NOT NULL
            );
        """)
        await db.execute("""
            CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id);
        """)
        await db.commit()

async def get_session_messages(session_id: str) -> Optional[List[Dict[str, Any]]]:
    db_path = get_db_file_path()
    async with aiosqlite.connect(db_path) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            "SELECT role, content, metadata FROM messages WHERE session_id = ? ORDER BY id ASC",
            (session_id,)
        ) as cursor:
            rows = await cursor.fetchall()
            if not rows:
                return None
            
            result = []
            for row in rows:
                msg: Dict[str, Any] = {
                    "role": row["role"],
                    "content": row["content"]
                }
                if row["role"] == "assistant" and row["metadata"]:
                    try:
                        msg["metadata"] = json.loads(row["metadata"])
                    except Exception:
                        pass
                result.append(msg)
            return result

async def save_message(session_id: str, role: str, content: str, metadata: Optional[Dict[str, Any]] = None):
    db_path = get_db_file_path()
    created_at = datetime.now(timezone.utc).isoformat()
    metadata_json = json.dumps(metadata) if metadata else None
    
    async with aiosqlite.connect(db_path) as db:
        await db.execute(
            """
            INSERT INTO messages (session_id, role, content, metadata, created_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (session_id, role, content, metadata_json, created_at)
        )
        await db.commit()

async def check_db_health() -> bool:
    try:
        db_path = get_db_file_path()
        async with aiosqlite.connect(db_path) as db:
            async with db.execute("SELECT 1") as cursor:
                row = await cursor.fetchone()
                return row is not None and row[0] == 1
    except Exception:
        return False

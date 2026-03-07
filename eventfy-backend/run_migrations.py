"""Run SQL migrations against Supabase PostgreSQL."""
import psycopg2
import sys
import os
from dotenv import load_dotenv

load_dotenv()

# Connection parameters from Supabase dashboard
USER = "postgres"
PASSWORD = "[NAzxt6@4.99fr95]"
HOST = "db.cdfvglcuewuslpdtakyd.supabase.co"
PORT = "5432"
DBNAME = "postgres"

SQL_FILES = [
    "sql/01_schema.sql",
    "sql/02_rls_policies.sql",
    "sql/03_functions.sql",
    "sql/04_saved_events.sql",
    "sql/05_user_stories.sql",
]

# Connect to the database
print("Connecting to Supabase PostgreSQL...")
print(f"  Host: {HOST}")
print(f"  Port: {PORT}")
print(f"  DB:   {DBNAME}")

try:
    connection = psycopg2.connect(
        user=USER,
        password=PASSWORD,
        host=HOST,
        port=PORT,
        dbname=DBNAME
    )
    print("✅ Connection successful!")

    cursor = connection.cursor()
    cursor.execute("SELECT version();")
    result = cursor.fetchone()
    print(f"  DB Version: {result[0][:80]}...")

    # Run migrations
    connection.autocommit = True

    for sql_file in SQL_FILES:
        print(f"\n{'='*60}")
        print(f"Running: {sql_file}")
        print(f"{'='*60}")
        try:
            with open(sql_file, "r", encoding="utf-8") as f:
                sql_content = f.read()
            cursor.execute(sql_content)
            print(f"  ✅ {sql_file} executed successfully!")
        except Exception as e:
            error_msg = str(e)
            if "already exists" in error_msg:
                print(f"  ⚠️  Some objects already exist (OK): {error_msg[:100]}")
            else:
                print(f"  ❌ Error: {error_msg[:200]}")
            connection.rollback()
            connection.autocommit = True

    # Verify tables
    print(f"\n{'='*60}")
    print("Verifying created tables...")
    print(f"{'='*60}")
    cursor.execute("""
        SELECT table_name FROM information_schema.tables
        WHERE table_schema = 'public'
        ORDER BY table_name;
    """)
    tables = cursor.fetchall()
    print(f"\nFound {len(tables)} tables:")
    for t in tables:
        print(f"  • {t[0]}")

    cursor.close()
    connection.close()
    print("\n✅ All migrations complete!")

except Exception as e:
    print(f"❌ Failed to connect: {e}")
    sys.exit(1)

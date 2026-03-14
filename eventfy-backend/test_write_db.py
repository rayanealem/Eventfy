import os
import uuid
import traceback
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_KEY")
supabase = create_client(url, key)

def test_database_write():
    print("Testing database write access...")

    # 1. Generate a test ID and test username
    test_id = str(uuid.uuid4())
    test_username = f"test_user_{test_id[:8]}"
    test_fullname = "Test User Fullname"

    print(f"Generated test_id: {test_id}, test_username: {test_username}")

    try:
        # Since `profiles` has a foreign key to `auth.users(id)`, we might not be able to insert
        # directly into `profiles` without an `auth.users` row.
        # Alternatively, we can test inserting into a table without foreign keys, like `skills`
        # or `tags` if we had them. Let's try `skills`.

        test_skill_id = str(uuid.uuid4())
        test_skill_name = f"test_skill_{test_skill_id[:8]}"

        print(f"Attempting to insert into 'skills' table: id={test_skill_id}, name={test_skill_name}")

        insert_res = supabase.table("skills").insert({
            "id": test_skill_id,
            "name": test_skill_name,
            "category": "other"
        }).execute()

        print("Insert successful!")
        print(f"Inserted data: {insert_res.data}")

        print("Attempting to delete the test data...")
        delete_res = supabase.table("skills").delete().eq("id", test_skill_id).execute()
        print("Delete successful!")
        print(f"Deleted data: {delete_res.data}")

        print("\nSUCCESS: Database write access verified.")

    except Exception as e:
        print("\nFAILED: Error during database operations.")
        traceback.print_exc()

if __name__ == "__main__":
    test_database_write()

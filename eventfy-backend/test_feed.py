import requests

API_URL = "http://127.0.0.1:8005/v1"

print("Fetching local feed...")
res = requests.get(f"{API_URL}/events/feed?scope=local&page=1&limit=5")
print("Status:", res.status_code)
try:
    data = res.json()
    events = data.get("events", [])
    print(f"Found {len(events)} events.")
    if len(events) == 0:
        print("Data:", data)
except Exception as e:
    print("Error:", e, res.text)

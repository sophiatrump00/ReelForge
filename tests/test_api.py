import requests
import time
import sys

API_URL = "http://localhost:8000/api/v1"

def wait_for_api():
    print("Waiting for API to be ready...")
    for i in range(30):
        try:
            resp = requests.get(f"http://localhost:8000/health")
            if resp.status_code == 200:
                print("API is ready!")
                return True
        except:
            pass
        time.sleep(1)
        print(".", end="", flush=True)
    print("\nAPI failed to start.")
    return False

def test_download_submit():
    print("\nTesting task submission...")
    payload = {
        "url": "https://www.tiktok.com/@test_user",
        "options": {"max_downloads": 1}
    }
    try:
        resp = requests.post(f"{API_URL}/download/task", json=payload)
        print(f"Status: {resp.status_code}")
        print(f"Response: {resp.json()}")
        if resp.status_code == 202:
            print("✅ Task submission successful")
        else:
            print("❌ Task submission failed")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    if wait_for_api():
        test_download_submit()
    else:
        sys.exit(1)

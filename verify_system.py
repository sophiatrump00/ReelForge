import requests
import json
import os
import sys
import time

BASE_URL = "http://localhost:8000/api/v1"

def log(msg, status="INFO"):
    print(f"[{status}] {msg}")

def test_settings():
    log("Testing Settings API...")
    # 1. Save Settings
    test_config = {
        "vendor": "custom",
        "api_base": "https://api.example.com/v1",
        "api_key": "sk-test-key-123",
        "vl_model": "test-model"
    }
    
    try:
        res = requests.post(f"{BASE_URL}/settings/", json=test_config)
        if res.status_code != 200:
            log(f"Failed to save settings: {res.text}", "ERROR")
            return False
            
        # 2. Load Settings
        res = requests.get(f"{BASE_URL}/settings/")
        if res.status_code != 200:
            log(f"Failed to load settings: {res.text}", "ERROR")
            return False
            
        data = res.json()
        if data['api_key'] == "sk-test-key-123":
            log("Settings API (Save/Load) - PASSED", "SUCCESS")
            return True
        else:
            log(f"Settings mismatch: {data}", "ERROR")
            return False
    except Exception as e:
        log(f"Settings Exception: {e}", "ERROR")
        return False

def test_keywords():
    log("Testing Keywords API...")
    test_kw = {
        "positive": ["awesome", "viral"],
        "negative": ["boring"],
        "categories": {}
    }
    
    try:
        res = requests.post(f"{BASE_URL}/keywords/", json=test_kw)
        if res.status_code != 200:
            log(f"Failed to save keywords: {res.text}", "ERROR")
            return False
            
        res = requests.get(f"{BASE_URL}/keywords/")
        data = res.json()
        if "awesome" in data['positive']:
            log("Keywords API (Save/Load) - PASSED", "SUCCESS")
            return True
        else:
            log("Keywords mismatch", "ERROR")
            return False
    except Exception as e:
        log(f"Keywords Exception: {e}", "ERROR")
        return False

def test_materials():
    log("Testing Materials/Files API...")
    # Ensure a file exists
    os.makedirs("/app/data/raw", exist_ok=True)
    with open("/app/data/raw/test_video.mp4", "w") as f:
        f.write("dummy content")
        
    try:
        res = requests.get(f"{BASE_URL}/materials/files/scan")
        if res.status_code != 200:
            log(f"Failed to scan files: {res.text}", "ERROR")
            return False
            
        data = res.json()
        # Look for the file in the tree
        # data is root folder
        found = False
        if data['children']:
            for child in data['children']:
                if child['name'] == 'raw':
                    for sub in child.get('children', []):
                        if sub['name'] == 'test_video.mp4':
                            found = True
                            break
        
        if found:
            log("Materials Scanner - PASSED", "SUCCESS")
            return True
        else:
            log(f"File not found in scan result: {json.dumps(data, indent=2)}", "ERROR")
            return False
    except Exception as e:
        log(f"Materials Exception: {e}", "ERROR")
        return False

def test_reports():
    log("Testing Reports API...")
    req = {
        "date_range": ["2023-01-01", "2023-12-31"],
        "content": ["summary"],
        "format": "csv"
    }
    try:
        res = requests.post(f"{BASE_URL}/reports/generate", json=req)
        if res.status_code == 200:
            if "text/csv" in res.headers.get("content-type", "") or res.content.startswith(b"Filename"):
                log("Reports Generation - PASSED", "SUCCESS")
                return True
            else:
                log(f"Reports returned invalid content type: {res.headers}", "ERROR")
                return False
        else:
            log(f"Reports failed: {res.text}", "ERROR")
            return False
    except Exception as e:
        log(f"Reports Exception: {e}", "ERROR")
        return False

def run_all():
    log("Starting System Verification Check...")
    results = []
    results.append(test_settings())
    results.append(test_keywords())
    results.append(test_materials())
    results.append(test_reports())
    
    if all(results):
        log("\nAll Systems Operational.", "SUCCESS")
        sys.exit(0)
    else:
        log("\nSome checks failed.", "ERROR")
        sys.exit(1)

if __name__ == "__main__":
    run_all()

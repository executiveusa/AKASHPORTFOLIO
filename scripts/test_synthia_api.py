import requests
import json

url = "http://localhost:3002/api/synthia"
payload = {"message": "Run git status and tell me the result."}
headers = {"Content-Type": "application/json"}

try:
    response = requests.post(url, json=payload, headers=headers, timeout=60)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")

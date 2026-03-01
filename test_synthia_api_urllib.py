import urllib.request
import json

url = "http://localhost:3002/api/synthia"
payload = {"message": "Run git status and tell me the result."}
headers = {"Content-Type": "application/json"}

req = urllib.request.Request(url, data=json.dumps(payload).encode(), headers=headers, method='POST')

try:
    with urllib.request.urlopen(req, timeout=60) as response:
        print(f"Status: {response.status}")
        print(f"Response: {response.read().decode()}")
except Exception as e:
    print(f"Error: {e}")

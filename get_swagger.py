import requests
import json

def get_swagger():
    url = "https://online-course-marketplace-backend-dc66.onrender.com/swagger/?format=openapi"
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        print(json.dumps(response.json(), indent=2))
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    get_swagger()

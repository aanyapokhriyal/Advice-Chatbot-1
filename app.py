
import os
from flask import Flask, request, jsonify, render_template
import requests
from dotenv import load_dotenv
from flask_cors import CORS

load_dotenv()

app = Flask(__name__)
CORS(app)
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
# Default model and optional comma-separated fallback list (set via .env)
DEFAULT_MODEL = os.getenv("DEFAULT_MODEL", "llama-3.3-70b-versatile")
FALLBACK_MODELS = os.getenv("FALLBACK_MODELS", DEFAULT_MODEL).split(",")

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/advice', methods=['POST'])
def get_advice():
    data = request.json
    messages = data.get('messages')
    model = data.get('model') or DEFAULT_MODEL
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    def call_model(model_id):
        payload = {"model": model_id, "messages": messages}
        return requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers=headers,
            json=payload
        )

    # First attempt
    response = call_model(model)
    try:
        json_resp = response.json()
    except ValueError:
        json_resp = {"error": {"message": response.text}}

    # Detect deprecation / decommission errors or HTTP error statuses and try fallbacks
    resp_text = str(json_resp).lower()
    if (response.status_code >= 400) or ("deprec" in resp_text) or ("decommission" in resp_text):
        for fallback in FALLBACK_MODELS:
            fallback = fallback.strip()
            if not fallback or fallback == model:
                continue
            retry = call_model(fallback)
            try:
                retry_json = retry.json()
            except ValueError:
                retry_json = {"error": {"message": retry.text}}
            if retry.ok:
                return jsonify(retry_json)
        # If no fallback succeeded, return the original response and status
        return jsonify(json_resp), response.status_code

    return jsonify(json_resp)

if __name__ == "__main__":
    import os
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)), debug=True)

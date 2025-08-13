
import os
from flask import Flask, request, jsonify, render_template
import requests
from dotenv import load_dotenv
from flask_cors import CORS

load_dotenv()

app = Flask(__name__)
CORS(app)
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/advice', methods=['POST'])
def get_advice():
    data = request.json
    messages = data.get('messages')
    model = data.get('model', 'llama3-70b-8192')
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": model,
        "messages": messages
    }
    response = requests.post(
        "https://api.groq.com/openai/v1/chat/completions",
        headers=headers,
        json=payload
    )
    return jsonify(response.json())

if __name__ == "__main__":
    import os
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)), debug=True)

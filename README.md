# Advice-Chatbot

An AI-powered Advice Chatbot that provides personalized, tone-based responses. Built with HTML, CSS, JavaScript, Bootstrap, Flask, and Groq API.

## Features

- Interactive web interface for chatting
- Tone selection for personalized advice
- Recent topics memory for context-aware responses
- Fast, AI-driven backend using Flask

## Technologies Used

- Frontend: HTML, CSS, JavaScript, Bootstrap
- Backend: Python (Flask)
- AI: Groq API


## Project Structure

- `app.py`: Flask backend serving API and frontend
- `templates/index.html`: Main HTML file served by Flask
- `static/style.css`: CSS styles
- `static/script.js`: JavaScript logic
- `.env`: Stores your Groq API key (not tracked by git)

## Setup Instructions

1. Clone the repository:
	```
	git clone https://github.com/aanyapokhriyal/Advice-Chatbot-1.git
	```
2. Install Python dependencies:
	```
	pip install -r requirements.txt
	```
3. Start the backend server:
	```
	python app.py
	```
4. Open your browser and go to `http://127.0.0.1:5000/`.


## Usage

- Select a tone and type your question to get instant advice.
- The chatbot stores your chat history and recent topics in your browser's localStorage.
- Old chats are saved but not displayed automatically when you reload the page.
- You can extend the app to show past chats on demand if desired.

## License

This project is licensed under the MIT License.

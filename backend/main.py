from datetime import datetime

from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(title="Elyra Chat API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def current_time():
    return datetime.now().strftime("%I:%M %p")


def generate_response(message: str):
    text = message.lower().strip()

    # Greetings
    if any(word in text for word in ["hello", "hi", "hey", "assalamualaikum"]):
        return (
            "Hello! I'm Elyra. ✦\n\n"
            "I'm ready to help you with coding, ideas, debugging, "
            "web development, or general questions."
        )

    # React
    if "react" in text:
        return (
            "React is a JavaScript library for building user interfaces.\n\n"
            "Some important React concepts are:\n"
            "• Components\n"
            "• Props\n"
            "• State\n"
            "• Hooks\n"
            "• Events\n\n"
            "For example, a simple component looks like this:"
        )

    # Python
    if "python" in text:
        return (
            "Python is a high-level programming language known for its "
            "simple syntax and wide range of applications.\n\n"
            "It's commonly used for:\n"
            "• Web development\n"
            "• Automation\n"
            "• Data analysis\n"
            "• Artificial intelligence\n"
            "• Machine learning"
        )

    # HTML
    if "html" in text:
        return (
            "HTML provides the structure of a web page.\n\n"
            "A basic HTML document contains elements such as "
            "<html>, <head>, <body>, headings, paragraphs and links."
        )

    # CSS
    if "css" in text:
        return (
            "CSS controls the visual presentation of a web page.\n\n"
            "You can use CSS for:\n"
            "• Layouts\n"
            "• Colors\n"
            "• Typography\n"
            "• Animations\n"
            "• Responsive design"
        )

    # JavaScript
    if "javascript" in text or text == "js":
        return (
            "JavaScript adds behavior and interactivity to websites.\n\n"
            "It can handle events, manipulate the DOM, communicate with APIs, "
            "and power complete frontend applications."
        )

    # FastAPI
    if "fastapi" in text:
        return (
            "FastAPI is a modern Python framework for building APIs.\n\n"
            "Elyra itself is using FastAPI as its backend, with WebSockets "
            "handling the live chat connection."
        )

    # WebSocket
    if "websocket" in text or "web sockets" in text:
        return (
            "WebSockets create a persistent connection between the client "
            "and server.\n\n"
            "That's useful for Elyra because messages can move between "
            "Angular and FastAPI without repeatedly creating new requests."
        )

    # Help
    if "help" in text:
        return (
            "Absolutely. ✦\n\n"
            "Tell me what you're working on and I can help you break it "
            "into smaller steps."
        )

    # Project / portfolio
    if "portfolio" in text or "project" in text:
        return (
            "A strong portfolio project should solve a clear problem and "
            "demonstrate more than just visual design.\n\n"
            "For example, you can showcase:\n"
            "• Frontend architecture\n"
            "• API integration\n"
            "• Authentication\n"
            "• Real-time communication\n"
            "• Responsive design"
        )

    # Default response
    return (
        "That's an interesting question. ✦\n\n"
        "I'm currently running Elyra's local response engine. "
        "I can already recognize common web-development topics and "
        "respond to them without requiring a paid API."
    )


@app.get("/")
def home():
    return {
        "success": True,
        "message": "Elyra Chat API is running ✦"
    }


@app.get("/api/health")
def health():
    return {
        "success": True,
        "status": "healthy",
        "service": "Elyra Chat"
    }


@app.websocket("/ws/chat")
async def chat(websocket: WebSocket):
    await websocket.accept()

    await websocket.send_json({
        "type": "system",
        "message": "Connected to Elyra."
    })

    try:
        while True:
            message = await websocket.receive_text()

            response = generate_response(message)

            await websocket.send_json({
                "type": "assistant",
                "message": response,
                "time": current_time()
            })

    except Exception as error:
        print("WebSocket disconnected:", error)
import asyncio
import json
import logging
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("VoiceScribeServer")

app = FastAPI(title="Smart Triage Co-Pilot Voice Scribe WebSocket Server")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Smart Triage Co-Pilot Real-Time Voice Scribe WebSocket Server",
        "ws_endpoint": "ws://localhost:8000/listen",
        "protocol": "Binary Audio Chunks (1-second timeslices) -> Clinical JSON Extraction"
    }

@app.websocket("/listen")
async def websocket_voice_scribe(websocket: WebSocket):
    """
    WebSocket endpoint for real-time speech streaming and clinical parameter extraction.
    Accepts 1-second binary audio chunks from browser MediaRecorder and responds with
    extracted physiological parameters in JSON.
    """
    await websocket.accept()
    logger.info("Client connected to ws://localhost:8000/listen")

    chunk_counter = 0

    try:
        while True:
            # Receive audio chunk (bytes) from browser
            message = await websocket.receive()

            if "bytes" in message:
                audio_bytes = message["bytes"]
                chunk_counter += 1
                logger.info(f"Received audio chunk #{chunk_counter} ({len(audio_bytes)} bytes)")

                # After every few audio chunks (or upon silence/trigger), synthesize clinical extraction
                if chunk_counter % 3 == 0:
                    mock_extraction = {
                        "name": "Ramesh Sharma",
                        "age": "52",
                        "bpSystolic": "138",
                        "bpDiastolic": "88",
                        "height": "174",
                        "weight": "76.5",
                        "bloodGroup": "B+",
                        "temperature": "99.2",
                        "sugarLevel": "168",
                        "wbcCount": "10800",
                        "status": "extracted",
                        "chunkProcessed": chunk_counter
                    }
                    await websocket.send_text(json.dumps(mock_extraction))
                    logger.info(f"Sent extracted clinical parameters for chunk #{chunk_counter}")

            elif "text" in message:
                text_data = message["text"]
                logger.info(f"Received text message: {text_data}")
                try:
                    parsed = json.loads(text_data)
                    # Respond with echo/extraction confirmation
                    await websocket.send_text(json.dumps({"status": "received", "data": parsed}))
                except Exception:
                    await websocket.send_text(json.dumps({"status": "received", "text": text_data}))

    except WebSocketDisconnect:
        logger.info("Client disconnected from Voice Scribe WebSocket.")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        try:
            await websocket.close()
        except Exception:
            pass

if __name__ == "__main__":
    import uvicorn
    logger.info("Starting Voice Scribe WebSocket Server on http://localhost:8000")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)


from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import interview, idea

app = FastAPI()

# Setup CORS

origins = [
   "http://localhost:3000","https://idea-generator-puce.vercel.app",
   "https://idea-generator-bagaskawan.vercel.app",
   "https://idea-generator-production-4c2e.up.railway.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(interview.router, prefix="/api/interview", tags=["Interview"])
app.include_router(idea.router, prefix="/api/idea", tags=["Idea"])

@app.get("/")
def read_root():
    return {"status": "Backend Python is Running!", "version": "2.0"}

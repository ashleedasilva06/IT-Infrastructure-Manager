from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio

from app.database.connection import engine
from app.database.base import Base
from app.routers import (
    auth_router, device_router, alert_router,
    dashboard_router, assignment_router, maintenance_router,
    network_router, export_router, history_router, activity_router,
    notification_router 

)
from app.services.monitor import monitor_devices
from app.models import activity_log
from app.models import notification_settings
# Import all models so SQLAlchemy creates tables
import app.models.user
import app.models.device
import app.models.alert
import app.models.device_status
import app.models.assignment
import app.models.maintenance


@asynccontextmanager
async def lifespan(app: FastAPI):
    asyncio.create_task(monitor_devices())
    yield


app = FastAPI(
    title="IT Infrastructure Manager",
    version="1.0.0",
    lifespan=lifespan
)

# CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables
Base.metadata.create_all(bind=engine)

# Routers
app.include_router(auth_router.router)
app.include_router(device_router.router)
app.include_router(alert_router.router)
app.include_router(dashboard_router.router)
app.include_router(assignment_router.router)
app.include_router(maintenance_router.router)
app.include_router(network_router.router)
app.include_router(export_router.router)
app.include_router(history_router.router)
app.include_router(activity_router.router)
app.include_router(notification_router.router)


@app.get("/")
def root():
    return {"message": "IT Infrastructure Manager API Running"}
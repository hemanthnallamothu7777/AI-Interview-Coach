import os
from motor.motor_asyncio import AsyncIOMotorClient

# Fetch MongoDB connection URI
mongo_uri = os.getenv("MONGO_URI")
if not mongo_uri:
    # Default to a local URI if not configured in environment variables
    mongo_uri = "mongodb://localhost:27017"

# Initialize Async MongoDB client using Motor
client = AsyncIOMotorClient(mongo_uri)

# Select AI-hiring-platform database
db = client["AI-hiring-platform"]

# Select users collection
users_collection = db["users"]

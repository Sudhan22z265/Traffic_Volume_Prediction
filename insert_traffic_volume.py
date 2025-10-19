from pymongo import MongoClient
from datetime import datetime, timedelta

# Connect to local MongoDB (default settings)
client = MongoClient('mongodb+srv://post123:post123@postpage.0llg7qj.mongodb.net/?retryWrites=true&w=majority&appName=PostPage')
db = client['traffic_db']
collection = db['traffic_volumes']

# Hardcoded traffic volumes for last 24 hours
base_time = datetime.now().replace(minute=0, second=0, microsecond=0)
hardcoded_volumes = [
    2100, 2050, 2080, 2150, 2200, 2180, 2160, 2120,
    2100, 2080, 2050, 2030, 2000, 1980, 1950, 1920,
    1900, 1880, 1850, 1820, 1800, 1780, 1750, 1720
]

records = []
for i, volume in enumerate(hardcoded_volumes[::-1]):
    record = {
        "timestamp": base_time - timedelta(hours=i),
        "traffic_volume": volume
    }
    records.append(record)

collection.delete_many({})  # Clear previous data for demo
collection.insert_many(records)
print(f"Inserted {len(records)} records into traffic_volumes collection.")

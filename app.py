from pymongo import MongoClient
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import joblib
import numpy as np
from datetime import datetime
import requests
import math
import time
import re
import unicodedata
from geopy.geocoders import Nominatim

app = Flask(__name__)
CORS(app)
# ===============================
# MongoDB setup
# ===============================
mongo_uri = 'mongodb+srv://post123:post123@postpage.0llg7qj.mongodb.net/?retryWrites=true&w=majority&appName=PostPage'  # Replace with Atlas URI if needed
mongo_client = MongoClient(mongo_uri)
mongo_db = mongo_client["traffic_db"]
mongo_collection = mongo_db["traffic_volumes"]
# ===============================
# API route to get last 24 traffic lags
# ===============================
@app.route('/api/traffic-lags', methods=['GET'])
def get_traffic_lags():
    date_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    # --- Fetch approximate location using geocoder ---
    import geocoder
    lat, lon = None, None
    try:
        g = geocoder.ip('me')
        if g.ok:
            lat, lon = g.latlng
    except Exception:
        pass
    if lat is None or lon is None:
        lat, lon = 28.6139, 77.2090  # fallback to New Delhi

    # --- Fetch weather data from Open-Meteo ---
    try:
        url = (
            f"https://api.open-meteo.com/v1/forecast?"
            f"latitude={lat}&longitude={lon}"
            f"&current_weather=true"
            f"&hourly=precipitation,dew_point_2m,relative_humidity_2m,visibility,snowfall"
            f"&temperature_unit=fahrenheit&windspeed_unit=mph"
        )
        resp = requests.get(url)
        if resp.ok:
            data = resp.json()
            current = data.get("current_weather", {})
            hourly = data.get("hourly", {})

            temp_f = current.get("temperature")
            wind_speed_mph = current.get("windspeed")
            wind_dir_deg = current.get("winddirection")
            dew_point_f = hourly.get("dew_point_2m", [0])[0]
            humidity = hourly.get("relative_humidity_2m", [0])[0]
            visibility_m = hourly.get("visibility", [0])[0]
            rain_mm = hourly.get("precipitation", [0])[0]
            snow_mm = hourly.get("snowfall", [0])[0]

            # Conversions
            rain_in = round(rain_mm / 25.4, 2)
            snow_in = round(snow_mm / 25.4, 2)
            visibility_miles = round(visibility_m / 1609.34, 2)
        else:
            temp_f = dew_point_f = humidity = rain_in = snow_in = wind_speed_mph = wind_dir_deg = visibility_miles = None
    except Exception:
        temp_f = dew_point_f = humidity = rain_in = snow_in = wind_speed_mph = wind_dir_deg = visibility_miles = None

    # --- Fetch Air Pollution Index (AQI) from WAQI ---
    air_pollution_index = None
    try:
        TOKEN = "demo"  # Replace with your WAQI token
        aqi_url = f"https://api.waqi.info/feed/geo:{lat};{lon}/?token={TOKEN}"
        aqi_resp = requests.get(aqi_url)
        if aqi_resp.ok:
            aqi_data = aqi_resp.json()
            if aqi_data.get("status") == "ok":
                air_pollution_index = aqi_data["data"]["aqi"]
    except Exception:
        pass

    # --- Holiday check ---
    is_holiday = 0
    try:
        url = f'http://localhost:5500/holidays'
        h_resp = requests.get(url)
        if h_resp.ok:
            holidays = h_resp.json().get('holidays', [])
            if holidays:
                is_holiday = 1
    except Exception:
        pass

    # --- Fetch last 24 traffic lag values from MongoDB ---
    try:
        cursor = mongo_collection.find({}, {"_id": 0, "traffic_volume": 1}).sort("timestamp", -1).limit(24)
        lags = [doc["traffic_volume"] for doc in cursor][::-1]
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    # --- Build the response ---
    response = {
        "lags": lags,
        "date_time": date_time,
        "is_holiday": is_holiday,
        "weather": {
            "latitude": lat,
            "longitude": lon,
            "temperature_F": temp_f,
            "dew_point_F": dew_point_f,
            "humidity_%": humidity,
            "rain_in_per_hr": rain_in,
            "snow_in_per_hr": snow_in,
            "wind_speed_mph": wind_speed_mph,
            "wind_direction_deg": wind_dir_deg,
            "visibility_miles": visibility_miles,
            "air_pollution_index": air_pollution_index
        }
    }

    return jsonify(response)



# ===============================
# Load trained model
# ===============================
model = joblib.load('traffic_forecast_xgb.pkl')


@app.route('/')
def home():
    return jsonify({"message": "Traffic Volume Prediction API is running 🚗"})


# ===============================
# Prediction route
# ===============================
@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get JSON input
        data = request.get_json(force=True)

        # Convert to DataFrame
        df = pd.DataFrame([data])

        # ====================================
        # Convert datetime field & extract features
        # ====================================
        if 'date_time' in df.columns:
            df['date_time'] = pd.to_datetime(df['date_time'])
            df['hour'] = df['date_time'].dt.hour
            df['day'] = df['date_time'].dt.day
            df['month'] = df['date_time'].dt.month
            df['day_of_week'] = df['date_time'].dt.dayofweek
            df['weekday'] = df['date_time'].dt.weekday
            df.drop(columns=['date_time'], inplace=True)

            # Cyclical encoding (to preserve periodic nature)
            df["hour_sin"] = np.sin(2 * np.pi * df["hour"] / 24)
            df["hour_cos"] = np.cos(2 * np.pi * df["hour"] / 24)
            df["weekday_sin"] = np.sin(2 * np.pi * df["weekday"] / 7)
            df["weekday_cos"] = np.cos(2 * np.pi * df["weekday"] / 7)

        # ====================================
        # Derive is_weekend (Saturday=5, Sunday=6)
        # ====================================
        if 'weekday' in df.columns:
            df['is_weekend'] = df['weekday'].isin([5, 6]).astype(int)
        else:
            df['is_weekend'] = 0

        # ====================================
        # Handle is_holiday (from request)
        # ====================================
        if 'is_holiday' in data:
            try:
                df['is_holiday'] = int(data['is_holiday'])
            except:
                df['is_holiday'] = 1 if str(data['is_holiday']).lower() in ['true', 'yes', '1'] else 0
        else:
            df['is_holiday'] = 0

        # ====================================
        # Handle lag values array
        # ====================================
        lags = data.get('lags', [])

        # If fewer than 24 lags, fill with 0; if more, truncate
        for i in range(1, 25):
            if len(lags) >= i:
                df[f'lag_{i}'] = lags[i - 1]
            else:
                df[f'lag_{i}'] = 0  # default fill

        # ====================================
        # Ensure all required model features exist
        # ====================================
        if hasattr(model, "get_booster"):
            cols_to_use = model.get_booster().feature_names
        elif hasattr(model, "feature_names_in_"):
            cols_to_use = model.feature_names_in_
        else:
            cols_to_use = df.columns

        missing_cols = []
        for col in cols_to_use:
            if col not in df.columns:
                df[col] = 0
                missing_cols.append(col)

        # Match dataframe column order to model input
        df = df[cols_to_use]

        # ====================================
        # Make prediction
        # ====================================
        prediction = model.predict(df)

        response = {
            "predicted_traffic_volume": float(prediction[0]),
            "zero_filled_columns": missing_cols
        }

        print("✅ Columns auto-filled with 0:", missing_cols)
        return jsonify(response)

    except Exception as e:
        return jsonify({"error": str(e)}), 400

# ===============================
# Crowd Alert API
# ===============================
@app.route('/api/crowd-alert', methods=['GET'])
def crowd_alert():
    # ===============================
    # Configuration
    # ===============================
    NEWS_API_URL = "https://newsdata.io/api/1/latest"
    NEWS_API_KEY = "pub_fc293776c4b74b5782c393f245be6906"
    OPENCAGE_API_KEY = "a84353e6fa8e4b379c05be4bab474fe4"

    # List of major Indian cities + all Tamil Nadu districts
    PLACES = [
        "Delhi", "Mumbai", "Chennai", "Bengaluru", "Hyderabad",
        "Kolkata", "Lucknow", "Jaipur", "Pune", "Ahmedabad",
        "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore",
        "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kanchipuram",
        "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai",
        "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai",
        "Ramanathapuram", "Ranipet", "Salem", "Sivagangai", "Tenkasi",
        "Thanjavur", "Theni", "Thiruvallur", "Thiruvarur", "Tiruchirappalli",
        "Tirunelveli", "Tiruppur", "Tiruvannamalai", "Vellore", "Viluppuram",
        "Virudhunagar", "Tirupattur"
    ]

    # ===============================
    # Utility functions
    # ===============================

    def clean_text(text):
        """Normalize and clean up text for matching."""
        if not text:
            return ""
        text = unicodedata.normalize("NFKD", text)
        text = re.sub(r"[^\w\s]", " ", text)
        text = re.sub(r"\s+", " ", text).strip().lower()
        return text

    def fetch_crowd_news():
        """Fetch latest news articles mentioning stampedes."""
        query = "stampede"
        all_articles = []
        next_page = None
        while len(all_articles) < 70:
            params = {"apikey": NEWS_API_KEY, "q": query, "country": "in"}
            if next_page:
                params["page"] = next_page
            try:
                r = requests.get(NEWS_API_URL, params=params, timeout=10)
                data = r.json()
                all_articles.extend(data.get("results", []))
                next_page = data.get("nextPage")
                if not next_page:
                    break
                time.sleep(1)
            except Exception as e:
                print(f"Error fetching news: {e}")
                break
        return all_articles[:30]

    geocode_cache = {}

    def extract_locations(articles):
        """Detect cities/districts mentioned in the news articles."""
        geolocator = Nominatim(user_agent="crowd-alert")
        locations = []
        for article in articles:
            text = clean_text(f"{article.get('title', '')} {article.get('description', '')}")
            for place in PLACES:
                pattern = r"\b" + re.escape(place.lower()) + r"\b"
                if re.search(pattern, text):
                    if place in geocode_cache:
                        loc = geocode_cache[place]
                    else:
                        try:
                            loc = geolocator.geocode(place)
                            if loc:
                                geocode_cache[place] = loc
                        except Exception as e:
                            print(f"Geocode error for {place}: {e}")
                            loc = None
                    if loc:
                        locations.append({
                            "place": place,
                            "lat": loc.latitude,
                            "lon": loc.longitude,
                            "title": article.get("title", "")
                        })
        return locations

    def haversine(lat1, lon1, lat2, lon2):
        """Calculate distance (km) between two lat/lon coordinates."""
        R = 6371
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
        c = 2 * math.asin(math.sqrt(a))
        return R * c

    # ===============================
    # Get user location
    # ===============================
    # If you want to use real user IP:
    # import geocoder
    # g = geocoder.ip('me')
    # lat, lon = g.latlng if g.ok else (10.9974, 76.9589)
    lat, lon = 10.9974, 76.9589  # fallback (Karur)

    # ===============================
    # Fetch crowd-related news
    # ===============================
    all_news = fetch_crowd_news()
    crowd_locations = extract_locations(all_news)

    # ===============================
    # Check proximity alerts
    # ===============================
    for loc in crowd_locations:
        dist = haversine(lat, lon, loc["lat"], loc["lon"])
        if dist <= 50:  # within 50 km radius
            return jsonify({
                "alert": True,
                "place": loc["place"],
                "distance_km": round(dist, 2),
                "title": loc["title"]
            })

    # ===============================
    # Fallback: check district via OpenCage API
    # ===============================
    try:
        resp = requests.get(
            f"https://api.opencagedata.com/geocode/v1/json?q={lat}%2C+{lon}&key={OPENCAGE_API_KEY}",
            timeout=10
        )
        district = None
        if resp.ok:
            data = resp.json()
            if data["results"]:
                components = data["results"][0]["components"]
                district = components.get("county") or components.get("state_district") or components.get("state")
    except Exception as e:
        print(f"Error fetching district: {e}")
        district = None

    if district:
        district_clean = clean_text(district)
        for article in all_news:
            title = clean_text(article.get('title'))
            desc = clean_text(article.get('description'))
            if district_clean in title or district_clean in desc:
                return jsonify({
                    "alert": True,
                    "district": district,
                    "title": article.get('title', '')
                })

    # ===============================
    # No alerts found
    # ===============================
    return jsonify({"alert": False, "message": "No crowd alerts nearby."})

# ===============================
# Run the app
# ===============================
if __name__ == '__main__':
    app.run(debug=True)

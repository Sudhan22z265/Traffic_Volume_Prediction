import requests
import math
from geopy.geocoders import Nominatim
import time

# List of main cities + all Tamil Nadu districts
PLACES = [
    "Delhi", "Mumbai", "Chennai", "Bengaluru", "Hyderabad",
    "Kolkata", "Lucknow", "Jaipur", "Pune", "Ahmedabad",
    # Tamil Nadu districts
    "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore",
    "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kanchipuram",
    "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai",
    "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai",
    "Ramanathapuram", "Ranipet", "Salem", "Sivagangai", "Tenkasi",
    "Thanjavur", "Theni", "Thiruvallur", "Thiruvarur", "Tiruchirappalli",
    "Tirunelveli", "Tiruppur", "Tiruvannamalai", "Vellore", "Viluppuram",
    "Virudhunagar", "Tirupattur"
]

# --- Step 1: Fetch news related to crowd events ---
def fetch_crowd_news():
    url = "https://newsdata.io/api/1/latest"
    api_key = "pub_fc293776c4b74b5782c393f245be6906"
    query = "stampede"

    all_articles = []
    next_page = None

    while len(all_articles) < 70:
        params = {"apikey": api_key, "q": query, "country": "in"}
        if next_page:
            params["page"] = next_page

        r = requests.get(url, params=params)
        data = r.json()
        all_articles.extend(data.get("results", []))
        next_page = data.get("nextPage")
        if not next_page:
            break
        time.sleep(1)

    return all_articles[:30]


# --- Step 2: Extract & Geocode location from news title/description ---
def extract_locations(articles):
    geolocator = Nominatim(user_agent="crowd-alert")
    locations = []

    for article in articles:
        text = f"{article.get('title', '')} {article.get('description', '')}"
        for place in PLACES:
            if place.lower() in text.lower():
                try:
                    loc = geolocator.geocode(place)
                    if loc:
                        locations.append({
                            "place": place,
                            "lat": loc.latitude,
                            "lon": loc.longitude,
                            "title": article.get("title", "")
                        })
                except:
                    pass
    return locations


# --- Step 3: Haversine distance ---
def haversine(lat1, lon1, lat2, lon2):
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * \
        math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    return R * c


# --- Step 4: Check if user is near crowd area ---
def check_user_in_crowd_area(user_lat, user_lon):
    print("Fetching crowd-related news...")
    news = fetch_crowd_news()
    crowd_locations = extract_locations(news)

    if not crowd_locations:
        print("No crowd locations found in news.")
        return

    print("\nNearby crowd alerts:")
    found = False
    for loc in crowd_locations:
        dist = haversine(user_lat, user_lon, loc["lat"], loc["lon"])
        if dist <= 10:  # within 10 km radius
            found = True
            print(f"⚠️ Crowd alert near {loc['place']} ({dist:.2f} km away)")
            print(f"   📰 {loc['title']}\n")

    if not found:
        print("✅ No crowd alerts nearby.")


# --- DEMO RUN (simulate user) ---
if __name__ == "__main__":
    # import geocoder
    # lat, lon = None, None
    # try:
    #     g = geocoder.ip('me')
    #     if g.ok:
    #         lat, lon = g.latlng
    # except Exception:
    #     pass
    # if lat is None or lon is None:
    lat, lon = 10.9601, 78.0766  # fallback to Karur

    all_news = fetch_crowd_news()
    crowd_locations = extract_locations(all_news)
    alert_given = False
    if lat is not None and lon is not None:
        for loc in crowd_locations:
            dist = haversine(lat, lon, loc["lat"], loc["lon"])
            if dist <= 50:
                print(f"\n⚠️ Crowd alert: Stampede news near {loc['place']} ({dist:.2f} km away)")
                print(f"   📰 {loc['title']}")
                alert_given = True
                break
    if alert_given:
        exit()

    print("\n--- All Crowd-Related News Articles ---")
    for idx, article in enumerate(all_news, 1):
        if isinstance(article, dict):
            print(f"{idx}. {article.get('title', '')}")
            print(f"   {article.get('description', '')}\n")
        else:
            print(f"{idx}. [Malformed article: {article}]")

    # Use OpenCageData API to get district
    API_KEY = "a84353e6fa8e4b379c05be4bab474fe4"
    url = f"https://api.opencagedata.com/geocode/v1/json?q={lat}%2C+{lon}&key={API_KEY}"
    resp = requests.get(url)
    district = None
    if resp.ok:
        data = resp.json()
        if data["results"]:
            components = data["results"][0]["components"]
            district = components.get("county") or components.get("state_district") or components.get("state")
            print("User District:", district)
        else:
            print("No location found.")
    else:
        print("Error fetching location:", resp.status_code, resp.text)

    # Check if district is present in any news article
    found = False
    if district:
        for article in all_news:
            if isinstance(article, dict):
                title = (article.get('title') or '').lower()
                desc = (article.get('description') or '').lower()
                if district.lower() in title or district.lower() in desc:
                    found = True
                    print(f"\n⚠️ Crowd alert for your district ({district})!")
                    print(f"   📰 {article.get('title', '')}\n")
        if not found:
            print(f"✅ No crowd alerts for your district ({district}).")
    else:
        print("District not determined, skipping district-based alert.")

    check_user_in_crowd_area(lat, lon)

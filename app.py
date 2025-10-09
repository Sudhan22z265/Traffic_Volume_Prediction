from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import joblib
import numpy as np
from datetime import datetime

app = Flask(__name__)
CORS(app)

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
# Run the app
# ===============================
if __name__ == '__main__':
    app.run(debug=True)

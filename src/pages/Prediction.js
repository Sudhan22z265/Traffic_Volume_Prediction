import React, { useState, useEffect } from "react";

const defaultLags = [];

function Prediction() {
  const [form, setForm] = useState({
    date_time: "",
    is_holiday: 7,
    air_pollution_index: 0,
    humidity: 0,
    wind_speed: 0,
    wind_direction: 0,
    visibility_in_miles: 0,
    dew_point: 0,
    temperature: 0,
    rain_p_h: 0,
    snow_p_h: 0,
    lags: defaultLags
  });
  const [lagsLoading, setLagsLoading] = useState(true);
  useEffect(() => {
    async function fetchAllInputs() {
      setLagsLoading(true);
      try {
        const res = await fetch("http://127.0.0.1:5000/api/traffic-lags");
        const data = await res.json();
        if (data) {
          setForm(f => ({
            ...f,
            date_time: data.date_time || "",
            is_holiday: data.is_holiday ?? 7,
            lags: Array.isArray(data.lags) && data.lags.length === 24 ? data.lags : defaultLags,
              air_pollution_index: data.weather?.air_pollution_index ?? 0,
              humidity: data.weather?.["humidity_%"] ?? 0,
            wind_speed: data.weather?.wind_speed_mph ?? 0,
            wind_direction: data.weather?.wind_direction_deg ?? 0,
            visibility_in_miles: data.weather?.visibility_miles ?? 0,
            dew_point: data.weather?.dew_point_F ?? 0,
            temperature: data.weather?.temperature_F ?? 0,
            rain_p_h: data.weather?.rain_in_per_hr ?? 0,
            snow_p_h: data.weather?.snow_in_per_hr ?? 0
          }));
        }
      } catch (err) {
        // fallback to defaultLags if needed
      }
      setLagsLoading(false);
    }
    fetchAllInputs();
  }, []);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLagChange = (idx, value) => {
    const newLags = [...form.lags];
    newLags[idx] = Number(value);
    setForm((prev) => ({ ...prev, lags: newLags }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError("");
    try {
      const response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          is_holiday: Number(form.is_holiday),
          air_pollution_index: Number(form.air_pollution_index),
          humidity: Number(form.humidity),
          wind_speed: Number(form.wind_speed),
          wind_direction: Number(form.wind_direction),
          visibility_in_miles: Number(form.visibility_in_miles),
          dew_point: Number(form.dew_point),
          temperature: Number(form.temperature),
          rain_p_h: Number(form.rain_p_h),
          snow_p_h: Number(form.snow_p_h),
          lags: form.lags.map(Number)
        })
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Server error");
      }
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || "Failed to fetch prediction.");
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 700, margin: "2rem auto", fontFamily: "sans-serif" }}>
      <div style={{ background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', borderRadius: 12, padding: '2.5rem 2rem' }}>
        <h2 style={{ color: '#1976d2', marginBottom: 24 }}>Traffic Prediction</h2>
        {lagsLoading ? (
          <div style={{ textAlign: 'center', color: '#1976d2', fontSize: 18, margin: '2rem 0' }}>
            Loading latest traffic lags...
          </div>
        ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 260 }}>
              <label>Date Time<br />
                <input type="text" name="date_time" value={form.date_time} onChange={handleChange} required style={inputStyle} />
              </label><br /><br />
              <label>Is Holiday<br />
                <input type="number" name="is_holiday" value={form.is_holiday} onChange={handleChange} required style={inputStyle} />
              </label><br /><br />
              <label>Air Pollution Index<br />
                <input type="number" name="air_pollution_index" value={form.air_pollution_index} onChange={handleChange} required style={inputStyle} />
              </label><br /><br />
              <label>Humidity<br />
                <input type="number" name="humidity" value={form.humidity} onChange={handleChange} required style={inputStyle} />
              </label><br /><br />
              <label>Wind Speed<br />
                <input type="number" name="wind_speed" value={form.wind_speed} onChange={handleChange} required style={inputStyle} />
              </label><br /><br />
              <label>Wind Direction<br />
                <input type="number" name="wind_direction" value={form.wind_direction} onChange={handleChange} required style={inputStyle} />
              </label><br /><br />
              <label>Visibility in Miles<br />
                <input type="number" name="visibility_in_miles" value={form.visibility_in_miles} onChange={handleChange} required style={inputStyle} />
              </label><br /><br />
            </div>
            <div style={{ flex: 1, minWidth: 260 }}>
              <label>Dew Point<br />
                <input type="number" name="dew_point" value={form.dew_point} onChange={handleChange} required style={inputStyle} />
              </label><br /><br />
              <label>Temperature<br />
                <input type="number" name="temperature" value={form.temperature} onChange={handleChange} required style={inputStyle} />
              </label><br /><br />
              <label>Rain p/h<br />
                <input type="number" name="rain_p_h" value={form.rain_p_h} onChange={handleChange} required style={inputStyle} />
              </label><br /><br />
              <label>Snow p/h<br />
                <input type="number" name="snow_p_h" value={form.snow_p_h} onChange={handleChange} required style={inputStyle} />
              </label><br /><br />
            </div>
          </div>
          <fieldset style={{ border: "1px solid #ccc", padding: "1rem", borderRadius: 8, marginTop: 24 }}>
            <legend style={{ fontWeight: 500 }}>Lags (24 values)</legend>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              {form.lags.map((lag, idx) => (
                <div key={idx}>
                  <label style={{ fontSize: 13 }}>Lag {idx + 1}<br />
                    <input type="number" value={lag} onChange={e => handleLagChange(idx, e.target.value)} required style={{ width: '100%', padding: '6px 8px', borderRadius: 4, border: '1px solid #bbb' }} />
                  </label>
                </div>
              ))}
            </div>
          </fieldset>
          <br />
          <button type="submit" disabled={loading} style={buttonStyle}>{loading ? "Predicting..." : "Predict"}</button>
        </form>
        )}
        <br />
        {error && (
          <div style={{ color: '#d32f2f', background: '#fff0f0', padding: '1rem', borderRadius: 6, marginBottom: 12 }}>
            <b>Error:</b> {error}
          </div>
        )}
        {result && (
          <ResultCard prediction={result.predicted_traffic_volume} result={result} />
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '8px 10px',
  borderRadius: 4,
  border: '1px solid #bbb',
  fontSize: 15
};

const buttonStyle = {
  background: '#1976d2',
  color: '#fff',
  padding: '0.7rem 2.2rem',
  borderRadius: 6,
  border: 'none',
  fontWeight: 500,
  fontSize: 18,
  cursor: 'pointer',
  marginTop: 10
};

function getTrafficCategory(volume) {
  if (volume < 2000) return { label: "Low", color: "#388e3c", icon: "🟢" };
  if (volume < 4000) return { label: "Mid", color: "#fbc02d", icon: "🟡" };
  return { label: "High", color: "#d32f2f", icon: "🔴" };
}

function ResultCard({ prediction, result }) {
  const category = getTrafficCategory(prediction);
  return (
    <div style={{ background: "#f6f6f6", padding: "2rem 1.5rem", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", textAlign: "center", marginTop: 10 }}>
      <div style={{ fontSize: 32, marginBottom: 10 }}>{category.icon}</div>
      <div style={{ fontSize: 22, fontWeight: 600, color: category.color, marginBottom: 8 }}>
        {category.label} Traffic Volume
      </div>
      <div style={{ fontSize: 18, color: "#2d3e50", marginBottom: 6 }}>
        Predicted Value: <b>{prediction.toFixed(2)}</b>
      </div>
    </div>
  );
}

export default Prediction;



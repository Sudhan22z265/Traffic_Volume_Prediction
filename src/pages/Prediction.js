import React, { useState } from "react";

const defaultLags = [
  2100, 2050, 2080, 2150, 2200, 2180, 2160, 2120,
  2100, 2080, 2050, 2030, 2000, 1980, 1950, 1920,
  1900, 1880, 1850, 1820, 1800, 1780, 1750, 1720
];

function Prediction() {
  const [form, setForm] = useState({
    date_time: "2012-05-18 06:00:00",
    is_holiday: 7,
    air_pollution_index: 121,
    humidity: 19,
    wind_speed: 2,
    wind_direction: 329,
    visibility_in_miles: 1,
    dew_point: 1,
    temperature: 288.28,
    rain_p_h: 0,
    snow_p_h: 0,
    lags: defaultLags
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

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
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setResult({ error: "Failed to fetch prediction." });
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 600, margin: "2rem auto", fontFamily: "sans-serif" }}>
      <h2>Traffic Prediction</h2>
      <form onSubmit={handleSubmit}>
        <label>Date Time:<br />
          <input type="text" name="date_time" value={form.date_time} onChange={handleChange} required />
        </label><br /><br />
        <label>Is Holiday:<br />
          <input type="number" name="is_holiday" value={form.is_holiday} onChange={handleChange} required />
        </label><br /><br />
        <label>Air Pollution Index:<br />
          <input type="number" name="air_pollution_index" value={form.air_pollution_index} onChange={handleChange} required />
        </label><br /><br />
        <label>Humidity:<br />
          <input type="number" name="humidity" value={form.humidity} onChange={handleChange} required />
        </label><br /><br />
        <label>Wind Speed:<br />
          <input type="number" name="wind_speed" value={form.wind_speed} onChange={handleChange} required />
        </label><br /><br />
        <label>Wind Direction:<br />
          <input type="number" name="wind_direction" value={form.wind_direction} onChange={handleChange} required />
        </label><br /><br />
        <label>Visibility in Miles:<br />
          <input type="number" name="visibility_in_miles" value={form.visibility_in_miles} onChange={handleChange} required />
        </label><br /><br />
        <label>Dew Point:<br />
          <input type="number" name="dew_point" value={form.dew_point} onChange={handleChange} required />
        </label><br /><br />
        <label>Temperature:<br />
          <input type="number" name="temperature" value={form.temperature} onChange={handleChange} required />
        </label><br /><br />
        <label>Rain p/h:<br />
          <input type="number" name="rain_p_h" value={form.rain_p_h} onChange={handleChange} required />
        </label><br /><br />
        <label>Snow p/h:<br />
          <input type="number" name="snow_p_h" value={form.snow_p_h} onChange={handleChange} required />
        </label><br /><br />
        <fieldset style={{ border: "1px solid #ccc", padding: "1rem" }}>
          <legend>Lags (24 values)</legend>
          {form.lags.map((lag, idx) => (
            <div key={idx} style={{ marginBottom: "0.5rem" }}>
              <label>Lag {idx + 1}: <input type="number" value={lag} onChange={e => handleLagChange(idx, e.target.value)} required /></label>
            </div>
          ))}
        </fieldset>
        <br />
        <button type="submit" disabled={loading}>{loading ? "Predicting..." : "Predict"}</button>
      </form>
      <br />
      {result && (
        <div style={{ background: "#f6f6f6", padding: "1rem", borderRadius: "6px" }}>
          <h3>Prediction Result</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default Prediction;



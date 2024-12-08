import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const TourGuideReport = () => {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState({
    itineraries: [],
    bookings: [],
    totalTourists: 0,
    itinerariesCount: 0,
  });
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    start: "",
    end: "",
  });

  useEffect(() => {
    const fetchTourGuideReport = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Please log in to view the report.");
        
        const decodedToken = jwtDecode(token);
        const guideId = decodedToken._id;
        if (!guideId) throw new Error("Invalid token. Unable to identify user.");

        const response = await axios.get(
          `http://localhost:5000/api/tourguide/${guideId}/get-report`
        );
        console.log("API Response:", response.data); // Debugging log
        setReport(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTourGuideReport();
  }, []);

  const formatDateInput = (date) => {
    if (!date) return "";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().split("T")[0]; // Format to YYYY-MM-DD
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.error("Invalid date:", dateString);
      return "Invalid Date";
    }
    return date.toLocaleDateString();
  };

  const filterItinerariesByDate = () => {
    if (!report.itineraries || (!dateRange.start && !dateRange.end)) {
      return report.itineraries;
    }

    const parseDate = (dateStr) => {
      if (!dateStr) return null;
      const date = new Date(dateStr);
      date.setHours(0, 0, 0, 0);
      if (isNaN(date.getTime())) {
        console.error("Invalid date input:", dateStr);
        return null;
      }
      return date;
    };

    const start = parseDate(dateRange.start);
    const end = parseDate(dateRange.end);

    return report.itineraries.filter((itinerary) => {
      const itineraryDate = parseDate(itinerary.createdAt);
      if (!itineraryDate) {
        console.error("Invalid itinerary date:", itinerary.createdAt);
        return false;
      }
      return (!start || itineraryDate >= start) && (!end || itineraryDate <= end);
    });
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <div
          style={{
            border: "4px solid #f3f3f3",
            borderTop: "4px solid #3498db",
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            animation: "spin 1s linear infinite",
            margin: "0 auto",
          }}
        ></div>
        <p style={{ marginTop: "20px" }}>Loading report...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", color: "red", padding: "50px" }}>
        <p>Error: {error}</p>
      </div>
    );
  }

  const filteredItineraries = filterItinerariesByDate();

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
      <h1 style={{ textAlign: "center", marginBottom: "30px", color: "#2c3e50" }}>
        Tour Guide Report
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        <div
          style={{
            backgroundColor: "#fff",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <h3>Total Tourists</h3>
          <p style={{ fontSize: "24px", fontWeight: "bold" }}>
            {report.totalTourists}
          </p>
        </div>
        <div
          style={{
            backgroundColor: "#fff",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <h3>Total Itineraries</h3>
          <p style={{ fontSize: "24px", fontWeight: "bold" }}>
            {report.itinerariesCount}
          </p>
        </div>
      </div>

      <div style={{ marginBottom: "30px" }}>
        <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "5px" }}>
              Start Date:
            </label>
            <input
              type="date"
              value={formatDateInput(dateRange.start)}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, start: e.target.value }))
              }
              style={{
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ddd",
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "5px" }}>
              End Date:
            </label>
            <input
              type="date"
              value={formatDateInput(dateRange.end)}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, end: e.target.value }))
              }
              style={{
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ddd",
              }}
            />
          </div>
        </div>
      </div>

      <div>
        <h2 style={{ marginBottom: "20px" }}>Itineraries</h2>
        {filteredItineraries.length > 0 ? (
          <div style={{ display: "grid", gap: "20px" }}>
            {filteredItineraries.map((itinerary) => (
              <div
                key={itinerary._id}
                style={{
                  backgroundColor: "#fff",
                  padding: "20px",
                  borderRadius: "8px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                <h3 style={{ marginBottom: "10px" }}>{itinerary.name}</h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "10px",
                  }}
                >
                  <p>Created At: {formatDate(itinerary.createdAt)}</p>
                  <p>Attendees: {itinerary.attendeesCount || "N/A"}</p>
                </div>
                {itinerary.description && (
                  <p style={{ marginTop: "10px", color: "#666" }}>
                    {itinerary.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p style={{ textAlign: "center", color: "#666" }}>
            No itineraries found for the selected date range.
          </p>
        )}
      </div>
    </div>
  );
};

export default TourGuideReport;

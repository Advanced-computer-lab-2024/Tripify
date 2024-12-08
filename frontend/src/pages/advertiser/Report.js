import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const TouristReport = () => {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(""); // Track the start date
  const [endDate, setEndDate] = useState(""); // Track the end date

  useEffect(() => {
    const fetchTouristReport = async () => {
      try {
        setLoading(true);

        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No token found. Please log in.");
        }

        const decodedToken = jwtDecode(token);
        const advertiserId = decodedToken._id;

        if (!advertiserId) {
          throw new Error("Invalid token. Advertiser ID missing.");
        }

        const response = await axios.get(
          `http://localhost:5000/api/advertiser/${advertiserId}/tourist-report`
        );

        setReport(response.data.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        setReport(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTouristReport();
  }, []);

  const getAttendedTouristCountPerActivity = (activityId) => {
    if (!report || !report.bookings) return 0;

    return report.bookings.filter(
      (booking) => booking.itemId?._id === activityId && booking.status === "attended"
    ).length;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(); // Customize as needed
  };

  const handleStartDateChange = (event) => {
    setStartDate(event.target.value); // Update the start date
  };

  const handleEndDateChange = (event) => {
    setEndDate(event.target.value); // Update the end date
  };

  const filterActivitiesByDateRange = () => {
    if ((!startDate && !endDate) || !report?.activities) return report?.activities;

    const startDateObj = startDate ? new Date(startDate) : null;
    const endDateObj = endDate ? new Date(endDate) : null;

    return report.activities.filter((activity) => {
      const activityDate = new Date(activity.createdAt); // Or use activity.activityDate
      const isAfterStartDate = startDateObj ? activityDate >= startDateObj : true;
      const isBeforeEndDate = endDateObj ? activityDate <= endDateObj : true;
      return isAfterStartDate && isBeforeEndDate;
    });
  };

  if (loading) return <div style={{ textAlign: "center", marginTop: "20px" }}>Loading report...</div>;
  if (error) return <div style={{ textAlign: "center", color: "red", marginTop: "20px" }}>Error: {error}</div>;

  const filteredActivities = filterActivitiesByDateRange();

  return (
    <div style={{ padding: "20px", fontFamily: "'Arial', sans-serif", maxWidth: "800px", margin: "auto" }}>
      <h1 style={{ textAlign: "center", color: "#2c3e50" }}>Tourist Report</h1>

      <div style={{ backgroundColor: "#ecf0f1", padding: "20px", borderRadius: "8px", marginBottom: "20px" }}>
        <p style={{ fontSize: "18px", margin: "10px 0" }}>
          <strong>Total Tourists:</strong> {report.totalTourists}
        </p>
        <p style={{ fontSize: "18px", margin: "10px 0" }}>
          <strong>Total Activities:</strong> {report.activitiesCount}
        </p>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label htmlFor="startDate" style={{ fontSize: "16px", marginRight: "10px" }}>
          Start Date:
        </label>
        <input
          type="date"
          id="startDate"
          value={startDate}
          onChange={handleStartDateChange}
          style={{ padding: "5px", fontSize: "16px", borderRadius: "4px", border: "1px solid #ddd", marginRight: "20px" }}
        />
        <label htmlFor="endDate" style={{ fontSize: "16px", marginRight: "10px" }}>
          End Date:
        </label>
        <input
          type="date"
          id="endDate"
          value={endDate}
          onChange={handleEndDateChange}
          style={{ padding: "5px", fontSize: "16px", borderRadius: "4px", border: "1px solid #ddd" }}
        />
      </div>

      <h2 style={{ color: "#34495e", borderBottom: "2px solid #34495e", paddingBottom: "5px" }}>Activities</h2>
      <ul style={{ listStyleType: "none", padding: 0 }}>
        {filteredActivities.map((activity) => (
          <li
            key={activity._id}
            style={{
              backgroundColor: "#f8f9fa",
              margin: "10px 0",
              padding: "15px",
              borderRadius: "8px",
              border: "1px solid #ddd",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h3 style={{ margin: 0, color: "#2c3e50" }}>{activity.name}</h3>
            <p style={{ margin: "10px 0", color: "#7f8c8d" }}>{activity.description}</p>
            <p style={{ margin: "10px 0", fontSize: "16px", color: "#16a085" }}>
              <strong>Tourists attended:</strong> {getAttendedTouristCountPerActivity(activity._id)}
            </p>
            <p style={{ margin: "10px 0", fontSize: "16px", color: "#16a085" }}>
              <strong>Activity Date:</strong> {formatDate(activity.createdAt)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TouristReport;

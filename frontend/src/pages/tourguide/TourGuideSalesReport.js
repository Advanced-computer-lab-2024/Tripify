import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const TourGuideSalesReport = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookings, setBookings] = useState([]);
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    platformFees: 0,
    netRevenue: 0,
    totalBookings: 0,
    itinerarySummary: {}
  });

  // New state for filters
  const [nameFilter, setNameFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchSalesData();
  }, []);

  const fetchSalesData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const decoded = jwtDecode(token);
      const guideId = decoded._id;

      const response = await axios.get(
        `http://localhost:5000/api/bookings/guide/${guideId}/sales`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const fetchedBookings = response.data.data.bookings;
      setSummary(response.data.data.summary);
      setBookings(fetchedBookings);
    } catch (error) {
      console.error("Error fetching sales data:", error);
      setError(error.message || "Error loading sales data");
    } finally {
      setLoading(false);
    }
  };

  // Filtered and memoized bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      const bookingDate = new Date(booking.bookingDate);
      
      // Name filter (case-insensitive)
      const nameMatch = booking.itineraryName.toLowerCase().includes(nameFilter.toLowerCase());
      
      // Date filters
      const startDateMatch = !startDate || bookingDate >= new Date(startDate);
      const endDateMatch = !endDate || bookingDate <= new Date(endDate);

      return nameMatch && startDateMatch && endDateMatch;
    });
  }, [bookings, nameFilter, startDate, endDate]);

  // Recalculate summary based on filtered bookings
  const filteredSummary = useMemo(() => {
    return {
      totalRevenue: filteredBookings.reduce((sum, booking) => sum + booking.itemId.totalPrice, 0),
      platformFees: filteredBookings.reduce((sum, booking) => sum + (booking.itemId.totalPrice * 0.1), 0),
      netRevenue: filteredBookings.reduce((sum, booking) => sum + (booking.itemId.totalPrice * 0.9), 0),
      totalBookings: filteredBookings.length
    };
  }, [filteredBookings]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-5">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="m-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Sales Report</h2>

      {/* Filters Section */}
      <div className="mb-4 flex flex-wrap gap-4">
        <input 
          type="text" 
          placeholder="Filter by Itinerary Name" 
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
          className="px-3 py-2 border rounded-md w-64"
        />
        <div className="flex items-center gap-2">
          <label className="text-gray-600">Start Date:</label>
          <input 
            type="date" 
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2 border rounded-md"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-gray-600">End Date:</label>
          <input 
            type="date" 
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2 border rounded-md"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-white shadow rounded-lg p-4">
          <div className="text-center">
            <h6 className="text-gray-500 text-sm">Total Revenue</h6>
            <h3 className="text-blue-600 text-2xl font-bold">
              ${filteredSummary.totalRevenue.toFixed(2)}
            </h3>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-4">
          <div className="text-center">
            <h6 className="text-gray-500 text-sm">Platform Fees (10%)</h6>
            <h3 className="text-red-600 text-2xl font-bold">
              -${filteredSummary.platformFees.toFixed(2)}
            </h3>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-4">
          <div className="text-center">
            <h6 className="text-gray-500 text-sm">Net Revenue</h6>
            <h3 className="text-green-600 text-2xl font-bold">
              ${filteredSummary.netRevenue.toFixed(2)}
            </h3>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-4">
          <div className="text-center">
            <h6 className="text-gray-500 text-sm">Total Bookings</h6>
            <h3 className="text-blue-600 text-2xl font-bold">
              {filteredSummary.totalBookings}
            </h3>
          </div>
        </div>
      </div>

      {/* Individual Bookings Section */}
      <div className="bg-white shadow rounded-lg p-4">
        <h4 className="text-xl font-semibold mb-4">Individual Bookings</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Itinerary</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tags</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Platform Fee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <tr key={booking._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(booking.bookingDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-semibold text-blue-600">
                    {booking.itineraryName}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {booking.tags?.map((tag, index) => (
                        <span 
                          key={index} 
                          className="bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">${booking.itemId.totalPrice.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-red-600">
                    -${(booking.itemId.totalPrice * 0.1).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-green-600">
                    ${(booking.itemId.totalPrice * 0.9).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      booking.status === "attended" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TourGuideSalesReport;
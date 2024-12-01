import React, { useState, useEffect } from "react";
import axios from "axios";
import destination1 from "../assets/images/destination-1.jpg";
import destination2 from "../assets/images/destination-2.jpg";
import destination3 from "../assets/images/destination-3.jpg";
import destination4 from "../assets/images/destination-4.jpg";
import destination5 from "../assets/images/destination-5.jpg";
import destination6 from "../assets/images/destination-6.jpg";

const TourDestinations = () => {
  const [activities, setActivities] = useState([]);

  // Fetch activities from the API
  const fetchActivities = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/activities");
      // Limit to the first 6 activities
      const limitedActivities = response.data.slice(0, 6);
      setActivities(limitedActivities);
    } catch (error) {
      console.error("Error fetching activities:", error);
    }
  };

  // Fetch activities when the component mounts
  useEffect(() => {
    fetchActivities();
  }, []);

  // Static images array
  const staticImages = [
    destination1,
    destination2,
    destination3,
    destination4,
    destination5,
    destination6,
  ];

  return (
    <section className="ftco-section ">
      <div className="container">
        <div className="row justify-content-center pb-4">
          <div className="col-md-12 heading-section text-center ftco-animate">
            <span className="subheading">Activities</span>
            <h2 className="mb-4">Tour Activities</h2>
          </div>
        </div>
        <div className="row">
          {activities.map((activity, index) => (
            <div className="col-md-4 ftco-animate" key={activity._id || index}>
              <div className="project-wrap">
                <a
                  href="/tourist/filtered-activities"
                  className="img"
                  style={{
                    backgroundImage: `url(${staticImages[index]})`,
                  }}
                >
                  <span className="price">${activity.price || "0"}/person</span>
                </a>
                <div className="text p-4">
                  <span className="days">
                    {activity.date
                      ? new Date(activity.date).toLocaleDateString()
                      : "N/A"}
                  </span>
                  <h3>
                    <a href="#">{activity.name || "Untitled Activity"}</a>
                  </h3>
                  <p>
                    <strong>Category:</strong>{" "}
                    <span style={{ marginLeft: "8px",
                      fontSize:"15px"
                     }}>{activity.category?.name || "Uncategorized"}</span>
                  </p>
                  <p><strong>Rating:</strong>{" "}
                  <span style={{ marginLeft: "8px",
                     fontSize:"15px"
                    }}>{activity.rating || "N/A"}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="row justify-content-center mt-4">
  <a
    href="/tourist/filtered-activities"
    className="btn btn-primary px-5 py-3 "
    style={{
      fontSize: "16px",
      fontWeight: "bold",
      textTransform: "uppercase",
      borderRadius: "30px",
      outline: "none", // Removes focus outline
      boxShadow: "none", // Removes any additional shadow
    }}
  >
    View All Activities
  </a>
</div>

      </div>
    </section>
  );
};

export default TourDestinations;

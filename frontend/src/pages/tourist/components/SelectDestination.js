import React from "react";
import place1 from "../assets/images/place-1.jpg"
import place2 from "../assets/images/place-2.jpg" 
import place3 from"../assets/images/place-3.jpg" 
import place4 from "../assets/images/place-4.jpg" 
import place5 from"../assets/images/place-5.jpg" 
import bgImage from "../assets/images/bg_3.jpg"
const SelectDestination = () => {
  const destinations = [
    { name: "Philippines", tours: "8 Tours", image:(`${place1}`) },
    { name: "Canada", tours: "2 Tours", image:(`${place2}`) },
    { name: "Thailand", tours: "5 Tours", image:(`${place3}`) },
    { name: "Australia", tours: "5 Tours", image:(`${place4}`) },
    { name: "Greece", tours: "7 Tours", image:(`${place5}`) },
  ];

  return (
    <section
      className="ftco-section img ftco-select-destination"
      style={{ backgroundImage: `url('${bgImage}' `}}
    >
      <div className="container">
        <div className="row justify-content-center pb-4">
          <div className="col-md-12 heading-section text-center ftco-animate">
            <span className="subheading">Pacific Provide Places</span>
            <h2 className="mb-4">Select Your Destination</h2>
          </div>
        </div>
      </div>
      <div className="container container-2">
        <div className="row">
          <div className="col-md-12">
            <div className="carousel-destination owl-carousel ftco-animate">
              {destinations.map((destination, index) => (
                <div className="item" key={index}>
                  <div className="project-destination">
                    <a
                      href="#"
                      className="img"
                      style={{
                        backgroundImage: `url('${destination.image}')`,
                      }}
                    >
                      <div className="text">
                        <h3>{destination.name}</h3>
                        <span>{destination.tours}</span>
                      </div>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SelectDestination;

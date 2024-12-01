import React from "react";
import bgImage from "../assets/images/bg_1.jpg";
import person1 from "../assets/images/person_1.jpg";
import person2 from "../assets/images/person_2.jpg";
import person3 from "../assets/images/person_3.jpg";

const testimonials = [
  {
    stars: 5,
    feedback: "Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts.",
    img: person1,
    name: "Roger Scott",
    position: "Marketing Manager",
  },
  {
    stars: 5,
    feedback: "Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts.",
    img: person2,
    name: "Roger Scott",
    position: "Marketing Manager",
  },
  {
    stars: 5,
    feedback: "Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts.",
    img: person3,
    name: "Roger Scott",
    position: "Marketing Manager",
  },
  {
    stars: 5,
    feedback: "Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts.",
    img: person1,
    name: "Roger Scott",
    position: "Marketing Manager",
  },
  {
    stars: 5,
    feedback: "Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts.",
    img: person2,
    name: "Roger Scott",
    position: "Marketing Manager",
  },
];

const TestimonialSection = () => {
  return (
    <section
      className="ftco-section testimony-section bg-bottom"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="overlay"></div>
      <div className="container">
        <div className="row justify-content-center pb-4">
          <div className="col-md-7 text-center heading-section heading-section-white ftco-animate">
            <span className="subheading">Testimonial</span>
            <h2 className="mb-4">Tourist Feedback</h2>
          </div>
        </div>
        <div className="row ftco-animate">
          <div className="col-md-12">
            <div className="carousel-testimony owl-carousel">
              {testimonials.map((testimonial, index) => (
                <div className="item" key={index}>
                  <div className="testimony-wrap py-4">
                    <div className="text">
                      <p className="star">
                        {Array.from({ length: testimonial.stars }).map((_, i) => (
                          <span className="fa fa-star" key={i}></span>
                        ))}
                      </p>
                      <p className="mb-4">{testimonial.feedback}</p>
                      <div className="d-flex align-items-center">
                        <div
                          className="user-img"
                          style={{
                            backgroundImage: `url(${testimonial.img})`,
                          }}
                        ></div>
                        <div className="pl-3">
                          <p className="name">{testimonial.name}</p>
                          <span className="position">{testimonial.position}</span>
                        </div>
                      </div>
                    </div>
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

export default TestimonialSection;

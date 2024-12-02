import React from "react";
import { Container, Row, Col, Card, Carousel } from "react-bootstrap";
import { motion } from "framer-motion";
import { Link } from 'react-router-dom';
import { FaPlaneDeparture, FaCar } from 'react-icons/fa';
import Navbar from "./components/Navbar";

import {
  FaMapMarkedAlt,
  FaRoute,
  FaUserTie,
  FaCompass,
  FaStar,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaQuoteLeft,
  FaPlay,
  FaChevronRight
} from "react-icons/fa";

const TouristAboutPage = () => {
  const heroStyle = {
    backgroundImage: 'url("/images/bg_1.jpg")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    minHeight: '60vh',
    position: 'relative',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingBottom: '3rem'
  };

  const overlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1
  };

  const services = [
    {
      icon: <FaMapMarkedAlt />,
      title: "Activities",
      description: "A small river named Duden flows by their place and supplies it with the necessary",
      bgImage: '/images/services-1.jpg',
      color: '#f85959'
    },
    {
      icon: <FaRoute />,
      title: "Travel Arrangements",
      description: "A small river named Duden flows by their place and supplies it with the necessary",
      bgImage: '/images/services-2.jpg',
      color: '#ffc000'
    },
    {
      icon: <FaUserTie />,
      title: "Private Guide",
      description: "A small river named Duden flows by their place and supplies it with the necessary",
      bgImage: '/images/services-3.jpg',
      color: '#1089ff'
    },
    {
      icon: <FaCompass />,
      title: "Location Manager",
      description: "A small river named Duden flows by their place and supplies it with the necessary",
      bgImage: '/images/services-4.jpg',
      color: '#0054ff'
    }
  ];

  const testimonials = [
    {
      name: "Emily Johnson",
      role: "Adventure Tourist",
      content: "Our family vacation was transformed into an unforgettable adventure. The attention to detail and personalized itinerary made every moment special. I highly recommend their expert travel planning services.",
      image: "/images/person_1.jpg",
      rating: 5
    },
    {
      name: "David Chen",
      role: "Business Traveler",
      content: "As a frequent business traveler, I appreciate their efficiency and professionalism. They handle all the details perfectly, from accommodation to transportation. A truly reliable travel partner.",
      image: "/images/person_2.jpg",
      rating: 5
    },
    {
      name: "Sarah Williams",
      role: "Solo Explorer",
      content: "The team made my solo trip both exciting and safe. Their local insights and wonderful tour guides helped me discover hidden gems I would have never found on my own. An exceptional travel agency!",
      image: "/images/person_3.jpg",
      rating: 5
    },
    {
      name: "James Anderson",
      role: "Family Vacationer",
      content: "Planning a trip for a family of five can be challenging, but they made it seamless. The activities were perfect for all ages, and the accommodations were fantastic. We'll definitely book with them again.",
      image: "/images/person_1.jpg",
      rating: 5
    },
    {
      name: "Maria Garcia",
      role: "Cultural Tourist",
      content: "Their deep understanding of local cultures and traditions made my cultural exploration truly authentic. The guided tours and cultural experiences were beyond my expectations.",
      image: "/images/person_2.jpg",
      rating: 5
    }
];

  return (
    <>
  <Navbar/>
    <div className="about-page">
      {/* Hero Section */}
      <div style={heroStyle}>
        <div style={overlayStyle}></div>
        <Container style={{ position: 'relative', zIndex: 2 }}>
          <div className="text-center text-white">
            <p className="mb-4">
              <span className="me-2">
                <a href="/tourist" className="text-white">
                  Home <FaChevronRight className="small" />
                </a>
              </span>
              <span>
                About us <FaChevronRight className="small" />
              </span>
            </p>
            <h1 className="display-4">About Us</h1>
          </div>
        </Container>
      </div>

      {/* Services Section */}
      <section className="py-5">
        <Container>
          <Row>
            <Col md={6} className="order-md-last">
            <div className="ps-md-5 d-flex align-items-center">
  <div>
    <span className="text-primary h6 text-uppercase">Welcome to Pacific</span>
    <h2 className="mb-4">It's time to start your adventure</h2>
    <p>A small river named Duden flows by their place and supplies it with the necessary regelialia. It is a paradisematic country, in which roasted parts of sentences fly into your mouth.</p>
    <p>Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts. Separated they live in Bookmarksgrove right at the coast of the Semantics, a large language ocean. A small river named Duden flows by their place and supplies it with the necessary regelialia.</p>
    <div className="d-flex gap-3">
      <Link to="/tourist/book-flight" className="btn btn-primary px-4 py-3">
        <FaPlaneDeparture className="me-2" />
        Book a Flight
      </Link>
      <Link to="/tourist/book-transportation" className="btn btn-primary px-4 py-3">
        <FaCar className="me-2" />
        Book Transportation
      </Link>
    </div>
  </div>
</div>
            </Col>
            <Col md={6}>
              <Row>
                {services.map((service, index) => (
                  <Col key={index} md={6} className="mb-4">
                    <div 
                      className="service-card h-100"
                      style={{
                        backgroundImage: `url(${service.bgImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        borderRadius: '5px',
                        overflow: 'hidden',
                        position: 'relative',
                        minHeight: '300px'
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.8))'
                        }}
                      ></div>
                      <div className="p-4 position-relative text-white" style={{ zIndex: 2 }}>
                        <div 
                          className="icon mb-4" 
                          style={{
                            width: '80px',
                            height: '80px',
                            background: service.color,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '2rem'
                          }}
                        >
                          {service.icon}
                        </div>
                        <h3 className="h5 mb-2">{service.title}</h3>
                        <p className="mb-0 small">{service.description}</p>
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Video Section */}
      <section 
        className="py-5" 
        style={{
          backgroundImage: 'url("/images/bg_4.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative'
        }}
      >
        <div style={overlayStyle}></div>
        <Container className="py-5">
          <div className="text-center position-relative" style={{ zIndex: 2 }}>
            <button 
              className="btn btn-primary rounded-circle p-4"
              style={{
                width: '100px',
                height: '100px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <FaPlay size={30} />
            </button>
          </div>
        </Container>
      </section>

      {/* About Intro Section */}
      <section className="py-5">
        <Container>
          <Row>
            <Col md={6}>
              <div 
                style={{
                  backgroundImage: 'url("/images/about-1.jpg")',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  height: '400px',
                  borderRadius: '5px'
                }}
              ></div>
            </Col>
            <Col md={6} className="ps-md-5 py-5">
  <span className="text-primary h6 text-uppercase">About Us</span>
  <h2 className="mb-4">Make Your Tour Memorable and Safe With Us</h2>
  <p>Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts. Separated they live in Bookmarksgrove right at the coast of the Semantics, a large language ocean.</p>
  <div className="d-flex gap-3">
    <Link to="/tourist/book-flight" className="btn btn-primary">
      <FaPlaneDeparture className="me-2" />
      Book a Flight
    </Link>
    <Link to="/tourist/book-transportation" className="btn btn-primary">
      <FaCar className="me-2" />
      Book Transportation
    </Link>
  </div>
</Col>

          </Row>
        </Container>
      </section>

      {/* Testimonials Section */}
      <section 
        className="py-5" 
        style={{
          backgroundImage: 'url("/images/bg_1.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative'
        }}
      >
        <div style={overlayStyle}></div>
        <Container className="position-relative" style={{ zIndex: 2 }}>
          <div className="text-center text-white mb-5">
            <span className="h6 text-uppercase">Testimonial</span>
            <h2 className="mb-4">Tourist Feedback</h2>
          </div>
          <Carousel 
            interval={5000} 
            indicators={false}
            controls={true}
          >
            {testimonials.map((testimonial, index) => (
              <Carousel.Item key={index}>
                <div className="bg-white p-4 mx-auto" style={{ maxWidth: '800px', borderRadius: '5px' }}>
                  <div className="text-center">
                    <div className="mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <FaStar key={i} className="text-warning mx-1" />
                      ))}
                    </div>
                    <p className="mb-4">{testimonial.content}</p>
                    <div className="d-flex align-items-center justify-content-center">
                      <div 
                        style={{
                          width: '60px',
                          height: '60px',
                          backgroundImage: `url(${testimonial.image})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          borderRadius: '50%',
                          marginRight: '15px'
                        }}
                      ></div>
                      <div className="text-start">
                        <h5 className="mb-0">{testimonial.name}</h5>
                        <small className="text-muted">{testimonial.role}</small>
                      </div>
                    </div>
                  </div>
                </div>
              </Carousel.Item>
            ))}
          </Carousel>
        </Container>
      </section>

      {/* Call to Action Section */}
      <section className="py-5">
        <Container>
          <div 
            className="text-center p-5 position-relative"
            style={{
              backgroundImage: 'url("/images/bg_2.jpg")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderRadius: '5px'
            }}
          >
            <div style={overlayStyle}></div>
            <div className="position-relative" style={{ zIndex: 2 }}>
              <h2 className="text-white mb-4">We Are Pacific A Travel Agency</h2>
              <p className="text-white mb-4">We can manage your dream building A small river named Duden flows by their place</p>
              <button className="btn btn-primary px-4 py-3">Ask For A Quote</button>
            </div>
          </div>
        </Container>
      </section>
    </div>
        </>

  );
};

export default TouristAboutPage;
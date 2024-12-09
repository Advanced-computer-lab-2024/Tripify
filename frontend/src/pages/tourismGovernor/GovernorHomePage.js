import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import GovernorNavbar from './GovernorNavbar';


import { 
  FaLandmark, 
  FaHistory, 
  FaTags, 
  FaKey,
  FaChevronRight,
  FaPlusCircle,
  FaList
} from "react-icons/fa";

const GovernorHomePage = () => {
  const heroStyle = {
    backgroundImage: 'url("/images/bg_1.jpg")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative',
    padding: '8rem 0 4rem 0',
    marginBottom: '2rem'
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

  const menuItems = [
    {
      title: "View Historical Places",
      description: "Browse and explore all historical places in the system",
      icon: <FaLandmark size={24} />,
      path: "/governor/view-places",
      color: "#1089ff"
    },
    {
      title: "My Created Places",
      description: "Manage the historical places you have created",
      icon: <FaPlusCircle size={24} />,
      path: "/governor/my-places",
      color: "#f85959"
    },
    {
      title: "Manage Tags",
      description: "Create and manage tags for historical places",
      icon: <FaTags size={24} />,
      path: "/governor/tag-management",
      color: "#ffc000"
    },
    {
      title: "Change Password",
      description: "Update your account password",
      icon: <FaKey size={24} />,
      path: "/governor/change-password",
      color: "#0054ff"
    }
  ];

  return (
    <>
     <GovernorNavbar />
    <div className="governor-home">
      {/* Hero Section */}
      <div style={heroStyle}>
        <div style={overlayStyle}></div>
        <Container style={{ position: 'relative', zIndex: 2 }}>
          <div className="text-center text-white">
            <p className="mb-4">
              <span>
                Tourism Governor Dashboard <FaChevronRight className="small" />
              </span>
            </p>
            <h1 className="display-4 mb-0">Welcome to Your Dashboard</h1>
          </div>
        </Container>
      </div>

      {/* Main Content */}
      <Container className="py-5">
        <Row className="g-4">
          {menuItems.map((item, index) => (
            <Col md={6} key={index}>
              <Link 
                to={item.path} 
                className="text-decoration-none"
              >
                <Card 
                  className="h-100 shadow-sm border-0 hover-card"
                  style={{ 
                    transition: 'transform 0.2s',
                    cursor: 'pointer'
                  }}
                  onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                  onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <Card.Body className="p-4">
                    <div className="d-flex align-items-center mb-3">
                      <div 
                        className="icon-circle me-3"
                        style={{
                          backgroundColor: item.color,
                          width: '50px',
                          height: '50px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white'
                        }}
                      >
                        {item.icon}
                      </div>
                      <div>
                        <h4 className="mb-0" style={{ color: item.color }}>{item.title}</h4>
                      </div>
                    </div>
                    <p className="text-muted mb-0">
                      {item.description}
                    </p>
                  </Card.Body>
                </Card>
              </Link>
            </Col>
          ))}
        </Row>

        {/* Quick Stats Section */}
        <Card className="mt-5 shadow-sm border-0">
          <Card.Body className="p-4">
            <div className="d-flex align-items-center mb-4">
              <FaList className="text-primary me-3" size={24} />
              <h3 className="mb-0">Quick Overview</h3>
            </div>
            <Row>
              <Col md={3}>
                <div className="text-center p-3">
                  <h2 className="text-primary mb-1">
                    <FaLandmark className="me-2" />
                    0
                  </h2>
                  <p className="text-muted mb-0">Total Places</p>
                </div>
              </Col>
              <Col md={3}>
                <div className="text-center p-3">
                  <h2 className="text-success mb-1">
                    <FaHistory className="me-2" />
                    0
                  </h2>
                  <p className="text-muted mb-0">Recent Updates</p>
                </div>
              </Col>
              <Col md={3}>
                <div className="text-center p-3">
                  <h2 className="text-warning mb-1">
                    <FaTags className="me-2" />
                    0
                  </h2>
                  <p className="text-muted mb-0">Active Tags</p>
                </div>
              </Col>
              <Col md={3}>
                <div className="text-center p-3">
                  <h2 className="text-info mb-1">
                    <FaLandmark className="me-2" />
                    0
                  </h2>
                  <p className="text-muted mb-0">Featured Places</p>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Container>
    </div>
    </>
  );
};

export default GovernorHomePage;
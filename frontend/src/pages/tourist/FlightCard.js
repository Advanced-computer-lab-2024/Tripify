import React, { memo } from 'react';
import { Card, Row, Col, Button } from 'react-bootstrap';

const FlightCard = memo(({ 
  flight, 
  onBook, 
  formatPrice, 
  formatDuration 
}) => {
  return (
    <Card className="mb-3 shadow-sm hover-shadow">
      <Card.Body>
        <Row className="align-items-center">
          <Col>
            {/* Flight Number and Route */}
            <h5 className="mb-1">
              {flight.itineraries[0].segments[0].carrierCode}
              {flight.itineraries[0].segments[0].number}
            </h5>
            <div className="text-muted">
              {flight.itineraries[0].segments[0].departure.iataCode} → 
              {flight.itineraries[0].segments[0].arrival.iataCode}
            </div>

            {/* Flight Times */}
            <small className="text-muted d-block">
              Departure: {new Date(flight.itineraries[0].segments[0].departure.at).toLocaleString()}
            </small>
            <small className="text-muted d-block">
              Arrival: {new Date(flight.itineraries[0].segments[0].arrival.at).toLocaleString()}
            </small>
            <small className="text-muted d-block">
              Duration: {formatDuration(flight.itineraries[0].duration)}
            </small>

            {/* Show if flight has stops */}
            {flight.itineraries[0].segments.length > 1 && (
              <small className="text-warning d-block">
                * This flight includes {flight.itineraries[0].segments.length - 1} stop(s)
              </small>
            )}
          </Col>

          {/* Price and Booking Button */}
          <Col xs="auto" className="text-end">
            <div className="h3 mb-2">
              {formatPrice(flight.price)}
            </div>
            <div className="d-grid">
              <Button 
                variant="primary"
                onClick={() => onBook(flight)}
              >
                Book Now
              </Button>
            </div>
          </Col>
        </Row>

        {/* Show detailed segments for flights with stops */}
        {flight.itineraries[0].segments.length > 1 && (
          <div className="mt-3 pt-3 border-top">
            <h6 className="mb-2">Flight Segments:</h6>
            {flight.itineraries[0].segments.map((segment, index) => (
              <div key={index} className="mb-2">
                <small className="text-muted d-block">
                  {segment.carrierCode}{segment.number}: {segment.departure.iataCode} → {segment.arrival.iataCode}
                </small>
                <small className="text-muted d-block">
                  Departure: {new Date(segment.departure.at).toLocaleString()}
                </small>
                <small className="text-muted d-block">
                  Arrival: {new Date(segment.arrival.at).toLocaleString()}
                </small>
                {/* Show layover duration if not the last segment */}
                {index < flight.itineraries[0].segments.length - 1 && (
                  <small className="text-warning d-block">
                    Layover: {(() => {
                      const currentArrival = new Date(segment.arrival.at);
                      const nextDeparture = new Date(flight.itineraries[0].segments[index + 1].departure.at);
                      const layoverMinutes = Math.floor((nextDeparture - currentArrival) / (1000 * 60));
                      return formatDuration(layoverMinutes);
                    })()}
                  </small>
                )}
              </div>
            ))}
          </div>
        )}
      </Card.Body>
    </Card>
  );
});

// Add custom styles
const styles = `
  .hover-shadow {
    transition: box-shadow 0.3s ease-in-out;
  }

  .hover-shadow:hover {
    box-shadow: 0 .5rem 1rem rgba(0,0,0,.15)!important;
  }

  .border-top {
    border-top: 1px solid #dee2e6!important;
  }

  .text-warning {
    color: #ffc107!important;
  }
`;

export default FlightCard;
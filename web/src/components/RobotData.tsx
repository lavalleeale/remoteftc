import React from "react";
import { Card, Col, Alert } from "react-bootstrap";

const RobotData = ({ robotStatus }: { robotStatus: robotStatus }) => {
  return (
    <Card className="w-100 h-100 m-3">
      <Card.Header as="h5" className="text-center">
        Robot Data
      </Card.Header>
      <Card.Body>
        State: {robotStatus?.status || "Unknown"}
        {robotStatus?.warningMessage && (
          <Col className="text-center">
            <Alert variant="warning">
              Warning: {robotStatus?.warningMessage}
            </Alert>
          </Col>
        )}
        {robotStatus?.errorMessage && (
          <Col className="text-center">
            <Alert variant="danger">Error: {robotStatus?.errorMessage}</Alert>
          </Col>
        )}
      </Card.Body>
    </Card>
  );
};

export default RobotData;

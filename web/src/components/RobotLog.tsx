import React from "react";
import { Card } from "react-bootstrap";

const RobotLog = ({ log }: { log: string[] }) => {
  return (
    <Card className="w-100 h-100">
      <Card.Header as="h5" className="text-center">
        Log
      </Card.Header>
      <Card.Body>
        <ul>
          {log.map((element, index) => (
            <li key={index}>{element}</li>
          ))}
        </ul>
      </Card.Body>
    </Card>
  );
};

export default RobotLog;

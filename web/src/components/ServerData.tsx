import React from "react";
import { Row, Col } from "react-bootstrap";

const ServerData = ({
  gamepad1,
  gamepad2,
}: {
  gamepad1: number | null;
  gamepad2: number | null;
}) => {
  return (
    <Row>
      <Col className="text-center">
        {`Gamepad 1: ${
          gamepad1 === 5
            ? "Keyboard"
            : Object.values(navigator.getGamepads()).find(
                (gamepad) => gamepad?.index === gamepad1
              )?.id || "Gamepad 1 not connected!"
        }`}
      </Col>
      <Col className="text-center">
        {`Gamepad 2: ${
          gamepad2 === 5
            ? "Keyboard"
            : Object.values(navigator.getGamepads()).find(
                (gamepad) => gamepad?.index === gamepad2
              )?.id || "Gamepad 2 not connected!"
        }`}
      </Col>
    </Row>
  );
};

export default ServerData;

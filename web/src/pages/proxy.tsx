import { Button, Container, FloatingLabel, Form, Stack } from "react-bootstrap";
import React from "react";
import { useEffect, useState } from "react";
import ReconnectingWebSocket from "reconnecting-websocket";
import { emptyController } from "../shared/controller";
import { Formik } from "formik";
import * as Yup from "yup";

const roomCodeValidationSchema = Yup.object().shape({
  roomCode: Yup.string().required("Please enter a room code"),
});

const Proxy = () => {
  const [watcherCount, setWatcherCount] = useState(0);
  const [roomCode, setRoomCode] = useState<number | string | null>(null);
  const [robotStatus, setRobotStatus] = useState(false);
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    var robotControl: ReconnectingWebSocket | null;
    var controller1 = emptyController;
    var controller2 = emptyController;
    const ws = new WebSocket(
      `${
        process.env.NODE_ENV === "production"
          ? "wss://remoteftc-api.lavallee.one"
          : "ws://localhost:4000"
      }/custom`
    );
    setWs(ws);
    ws.addEventListener("message", function (event) {
      const data = JSON.parse(event.data);
      switch (data.type) {
        case "roomcode":
          setRoomCode(data.value);
          break;
        case "watcherCount":
          setWatcherCount(data.value);
          break;
        case "controller":
          if (data.number === 1) {
            controller1 = data.data;
          } else {
            controller2 = data.data;
          }
          break;
        default:
          if (robotControl?.readyState === WebSocket.OPEN) {
            robotControl!.send(event.data);
          }
          break;
      }
    });
    ws.addEventListener("open", () => {
      const ROBOT_ADDRESS = "192.168.43.1";
      robotControl = new ReconnectingWebSocket(`ws://${ROBOT_ADDRESS}:6969`);
      robotControl.addEventListener("open", function (event) {
        setRobotStatus(true);
      });
      robotControl.addEventListener("close", function (event) {
        setRobotStatus(false);
      });
      robotControl.addEventListener("message", function (event) {
        ws!.send(event.data);
      });
    });
    var interval: NodeJS.Timer;
    interval = setInterval(() => {
      if (robotControl?.readyState === WebSocket.OPEN) {
        robotControl.send(
          JSON.stringify({
            type: "RECEIVE_GAMEPAD_STATE",
            gamepad1: controller1,
            gamepad2: controller2,
          })
        );
      }
    }, 50);
    return () => {
      ws.close();
      robotControl?.close();
      setRobotStatus(false);
      clearInterval(interval);
    };
  }, []);

  return (
    <Container fluid className="d-grid h-100 p-2">
      {roomCode ? (
        <ul className="list-group list-group-flush">
          <li className="list-group-item">
            Room code: {roomCode || "Room code not found!"}
          </li>
          <li className="list-group-item">Watchers: {watcherCount}</li>
          <li className="list-group-item">
            Robot status: {robotStatus ? "Connected" : "Disconnected"}
          </li>
        </ul>
      ) : (
        <>
          <Formik
            validationSchema={roomCodeValidationSchema}
            initialValues={{ roomCode: "" }}
            onSubmit={(e) => {
              ws?.send(JSON.stringify({ type: "proxy", code: e.roomCode }));
            }}
          >
            {({ values, errors, handleChange, handleSubmit }) => (
              <Form onSubmit={handleSubmit} className="d-flex mb-3 mt-3 ">
                <FloatingLabel
                  className="w-75"
                  controlId="formRoomCode"
                  label="Room Code"
                >
                  <Form.Control
                    name="roomCode"
                    value={values.roomCode}
                    isInvalid={errors.roomCode !== undefined}
                    onChange={handleChange}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.roomCode}
                  </Form.Control.Feedback>
                </FloatingLabel>
                <Button
                  className="w-25"
                  style={{ height: "calc(3.5rem + 2px)" }}
                  variant="primary"
                  type="submit"
                >
                  Custom Code
                </Button>
              </Form>
            )}
          </Formik>
          <Button
            onClick={() =>
              ws?.send(JSON.stringify({ type: "proxy", code: "random" }))
            }
          >
            Random Code
          </Button>
        </>
      )}
    </Container>
  );
};

export default Proxy;

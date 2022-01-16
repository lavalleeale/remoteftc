import {
  Alert,
  Button,
  Container,
  Form,
  Row,
  Col
} from "react-bootstrap";
import * as Yup from "yup";
import { Formik } from "formik";
import React, { useState, useEffect, ReactFragment } from "react";
import { controller, emptyController } from "../shared/controller";

function controllerFromGamepad(gamepad: Gamepad) {
  return {
    left_stick_x: gamepad.axes[0],
    left_stick_y: gamepad.axes[1],
    right_stick_x: gamepad.axes[2],
    right_stick_y: gamepad.axes[3],
    dpad_up: gamepad.buttons[12].pressed,
    dpad_down: gamepad.buttons[13].pressed,
    dpad_left: gamepad.buttons[14].pressed,
    dpad_right: gamepad.buttons[15].pressed,
    a: gamepad.buttons[0].pressed,
    b: gamepad.buttons[1].pressed,
    x: gamepad.buttons[2].pressed,
    y: gamepad.buttons[3].pressed,
    guide: gamepad.buttons[16].pressed,
    start: gamepad.buttons[9].pressed,
    back: gamepad.buttons[8].pressed,
    left_bumper: gamepad.buttons[4].pressed,
    right_bumper: gamepad.buttons[5].pressed,
    left_stick_button: gamepad.buttons[10].pressed,
    right_stick_button: gamepad.buttons[11].pressed,
    left_trigger: gamepad.buttons[6].pressed ? 1 : 0,
    right_trigger: gamepad.buttons[7].pressed ? 1 : 0,
    index: gamepad.index,
  } as controller;
}

type robotStatus = {
  activeOpMode: string;
  activeOpModeStatus: "RUNNING" | "INIT" | "STOPPED";
  errorMessage: string;
  warningMessage: string;
};

const Proxy = () => {
  const [gamepad1, setGamepad1] = useState<number | null>(null);
  const [gamepad2, setGamepad2] = useState<number | null>(null);
  const [kbController, setKbController] = useState<controller>({
    ...emptyController,
    index: 5,
  });
  const [opmodes, setOpmodes] = useState<string[] | null>(null);
  const [robotStatus, setRobotStatus] = useState<robotStatus | null>(null);
  const [selectedOpmode, setSelectedOpmode] = useState("");
  const [roomCode, setRoomCode] = useState(111111);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [wsStatus, setWsStatus] = useState(false);
  const [watcherCount, setWatcherCount] = useState<number | null>(null);

  useEffect(() => {
    const removeGamepad = (e: GamepadEventInit) => {
      if (gamepad1 === e.gamepad.index) {
        setGamepad1(null);
        if (ws?.readyState === WebSocket.OPEN) {
          ws!.send(
            JSON.stringify({
              type: "controller",
              number: 1,
              data: emptyController,
            })
          );
        }
      } else if (gamepad2 === e.gamepad.index) {
        setGamepad2(null);
        if (ws?.readyState === WebSocket.OPEN) {
          ws!.send(
            JSON.stringify({
              type: "controller",
              number: 2,
              data: emptyController,
            })
          );
        }
      }
    };
    window.addEventListener("gamepaddisconnected", removeGamepad, false);
    return () => {
      window.removeEventListener("gamepaddisconnected", removeGamepad, false);
    };
  }, [gamepad1, gamepad2, ws]);

  useEffect(() => {
    function setKey(key: String, float: number, bool: boolean) {
      console.log(key, float, bool);
      switch (key) {
        case "w":
          setKbController({ ...kbController, left_stick_y: float });
          break;
        case "s":
          setKbController({ ...kbController, left_stick_y: -float });
          break;
        case "a":
          setKbController({ ...kbController, left_stick_x: -float });
          break;
        case "d":
          setKbController({ ...kbController, left_stick_x: float });
          break;
        case "ArrowUp":
          setKbController({ ...kbController, right_stick_y: float });
          break;
        case "ArrowDown":
          setKbController({ ...kbController, right_stick_y: -float });
          break;
        case "ArrowLeft":
          setKbController({ ...kbController, right_stick_x: -float });
          break;
        case "ArrowRight":
          setKbController({ ...kbController, right_stick_x: float });
          break;
        case "q":
          setKbController({ ...kbController, left_trigger: float });
          break;
        case "e":
          setKbController({ ...kbController, right_trigger: float });
          break;
        case "\\":
          setKbController({ ...kbController, back: bool });
          break;
        case "Enter":
          setKbController({ ...kbController, start: bool });
          break;
        case "z":
          setKbController({ ...kbController, a: bool });
          break;
        case "x":
          setKbController({ ...kbController, b: bool });
          break;
        case "c":
          setKbController({ ...kbController, x: bool });
          break;
        case "v":
          setKbController({ ...kbController, y: bool });
          break;
        case "n":
          setKbController({ ...kbController, left_bumper: bool });
          break;
        case "m":
          setKbController({ ...kbController, right_bumper: bool });
          break;
        default:
          break;
      }
    }
    function keyPress(e: KeyboardEvent) {
      if (!e.repeat) {
        setKey(e.key, 0.5, true);
      }
    }
    function keyRelease(e: KeyboardEvent) {
      setKey(e.key, 0, false);
    }
    window.addEventListener("keydown", keyPress, false);
    window.addEventListener("keyup", keyRelease, false);
    return () => {
      window.removeEventListener("keydown", keyPress, false);
      window.removeEventListener("keyup", keyRelease, false);
    };
  }, [kbController]);

  useEffect(() => {
    const interval = setInterval(() => {
      [
        ...Object.values(navigator.getGamepads())
          .filter((gamepad) => gamepad !== null)
          .map((gamepad) => controllerFromGamepad(gamepad!)),
        kbController,
      ].forEach((controller) => {
        if (controller.start && controller.a) {
          setGamepad1(controller.index);
          if (controller.index === gamepad2) {
            if (ws?.readyState === WebSocket.OPEN) {
              ws!.send(
                JSON.stringify({
                  type: "controller",
                  number: 2,
                  data: emptyController,
                })
              );
            }
            setGamepad2(null);
            return;
          }
        } else if (controller.start && controller.b) {
          setGamepad2(controller.index);
          if (controller.index === gamepad1) {
            setGamepad1(null);
            if (ws?.readyState === WebSocket.OPEN) {
              ws!.send(
                JSON.stringify({
                  type: "controller",
                  number: 1,
                  data: emptyController,
                })
              );
            }
            setGamepad2(null);
            return;
          }
        } else {
          if (controller.index === gamepad1) {
            if (ws?.readyState === WebSocket.OPEN) {
              ws.send(
                JSON.stringify({
                  type: "controller",
                  number: 1,
                  data: controller,
                })
              );
            }
          } else if (controller.index === gamepad2) {
            if (ws?.readyState === WebSocket.OPEN) {
              ws.send(
                JSON.stringify({
                  type: "controller",
                  number: 2,
                  data: controller,
                })
              );
            }
          }
        }
      });
    }, 50);
    return () => {
      clearInterval(interval);
    };
  }, [gamepad1, gamepad2, ws, kbController]);

  useEffect(() => {
    const ws = new WebSocket(
      `${
        process.env.NODE_ENV === "production"
          ? "wss://remoteftc-api.lavallee.one"
          : "ws://localhost:4000"
      }/custom`
    );
    ws.addEventListener("open", () => {
      setWsStatus(true);
    });
    ws.addEventListener("message", function (event) {
      const data = JSON.parse(event.data);
      switch (data.type) {
        case "watcherCount":
          setWatcherCount(data.value);
          break;
        case "RECEIVE_ROBOT_STATUS":
          setRobotStatus(data.status);
          break;
        case "opmodes":
          setOpmodes(data.value);
          break;
        case "disconnect":
          setOpmodes(null);
          setWatcherCount(null);
          setRobotStatus(null);
          setRoomCode(111111);
          break;
        default:
          break;
      }
    });
    setWs(ws);
    return () => {
      ws.close();
      setWs(null);
      setWsStatus(false);
    };
  }, []);

  const validationSchema = Yup.object().shape({
    roomCode: Yup.string()
      .required("Please enter a room code")
      .min(6, "Room code must be exactly 6 digits")
      .max(6, "Room code must be exactly 6 digits"),

  });

  return (
    <div>
      <Container fluid className="d-grid h-100">
        {!watcherCount ? (
          <Formik
            validationSchema={validationSchema}
            onSubmit={(values) => {
              ws?.send(JSON.stringify({ type: "joinroom", roomcode: values.roomCode }));
              console.log(values.roomCode)
            }}
            initialValues={{
              roomCode: '',
            }}
          >
            {({
              handleSubmit,
              handleChange,
              handleBlur,
              values,
              touched,
              isValid,
              errors,
            }) => (
              <Form noValidate onSubmit={handleSubmit} className="text-center p-3 w-100">
                <Form.Group className="mb-3" controlId="formRoomCode">
                  <Form.Label>Room Code</Form.Label>
                  <Form.Control
                    disabled={!wsStatus}
                    type="number"
                    name="roomCode"
                    placeholder="000000"
                    value={values.roomCode}
                    isInvalid={!!errors.roomCode}
                    onChange={handleChange}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.roomCode}
                  </Form.Control.Feedback>
                </Form.Group>
                <div className="d-grid">
                  <Button variant="primary" type="submit" disabled={!wsStatus}>
                    Submit
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        ) : (
          <Formik
            validationSchema={validationSchema}
            onSubmit={(values) => {
              ws?.send(JSON.stringify({ type: "INIT_OP_MODE", opModeName: values.selectedOpmode }));
              console.log(values.selectedOpmode);
            }}
            initialValues={{
              selectedOpmode: ''
            }}
          >
            {({
              handleSubmit,
              handleChange,
              handleBlur,
              values,
              touched,
              isValid,
              errors,
            }) => (
              <Container fluid className="d-grid h-100">
                <Form onSubmit={handleSubmit} className="text-center p-3 w-100">
                  <Form.Group
                    controlId="formOpmode"
                    className="mb-3"
                  >
                    <Form.Label>Select Opmode</Form.Label>
                    <Form.Select
                      disabled={
                        selectedOpmode === "$Stop$Robot$" || opmodes === undefined
                      }
                    >
                      {[...(opmodes || []), "$Stop$Robot$"].map((opmode) => (
                        <option value={opmode} key={opmode}>
                          {opmode === "$Stop$Robot$" ? "None" : opmode}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                  <div className="d-grid">
                    {robotStatus === null ||
                    robotStatus?.activeOpMode === "$Stop$Robot$" ? (
                      <Button
                        variant="primary"
                        type="submit"
                        disabled={
                          selectedOpmode === "$Stop$Robot$" || opmodes === undefined
                        }
                      >
                        Init
                      </Button>
                    ) : (
                      <Row>
                        {robotStatus?.activeOpModeStatus !== "STOPPED" ? (
                          <Button
                            variant={
                              robotStatus?.activeOpModeStatus === "RUNNING"
                                ? "danger"
                                : "success"
                            }
                            onClick={() => {
                              ws!.send(
                                JSON.stringify({
                                  type: `${
                                    robotStatus?.activeOpModeStatus === "RUNNING"
                                      ? "STOP"
                                      : "START"
                                  }_OP_MODE`,
                                })
                              );
                            }}
                          >
                            {robotStatus?.activeOpModeStatus === "RUNNING"
                              ? "Stop"
                              : "Start"
                            }
                          </Button>
                        ): (
                          <Button
                            variant="danger"
                            disabled
                          >
                            STOPPED
                          </Button>
                        )}
                      </Row>
                    )}
                  </div>
                </Form>
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
                  <Col className="text-center">Watcher count: {watcherCount}</Col>
                </Row>
                <Row>
                  {robotStatus?.warningMessage && (
                    <Col className="text-center">
                      <Alert variant="warning">
                        Warning: {robotStatus?.warningMessage}
                      </Alert>
                    </Col>
                  )}
                  {robotStatus?.errorMessage && (
                    <Col className="text-center">
                      <Alert variant="danger">
                        Error: {robotStatus?.errorMessage}
                      </Alert>
                    </Col>
                  )}
                </Row>
              </Container>
            )}
          </Formik>
        )}
      </Container>
    </div>
  );
};

export default Proxy;

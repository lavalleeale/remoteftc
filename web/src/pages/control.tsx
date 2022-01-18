import {
  Alert,
  Button,
  Container,
  Form,
  Row,
  Col,
  Modal,
  FloatingLabel,
} from "react-bootstrap";
import * as Yup from "yup";
import { useFormik } from "formik";
import React, { useState, useEffect } from "react";
import { controller, emptyController } from "../shared/controller";
import { groupBy, last, map } from "lodash";

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

const roomCodeValidationSchema = Yup.object().shape({
  roomCode: Yup.string()
    .required("Please enter a room code")
    .min(6, "Room code must be exactly 6 digits")
    .max(6, "Room code must be exactly 6 digits"),
});

const opmodeValidationSchema = Yup.object().shape({
  selectedOpmode: Yup.string()
    .required("A valid Opmode must be selected")
    .notOneOf(["", "$Stop$Robot$"], "A valid Opmode must be selected"),
});

type robotStatus = {
  opModeName: string;
  status: "RUNNING" | "INIT" | "STOPPED";
  errorMessage: string;
  warningMessage: string;
};
type opmode = {
  flavor: "TELEOP" | "AUTONOMOUS";
  group: string;
  name: string;
  source: undefined | "ANDROID_STUDIO" | "BLOCKLY" | "ONBOTJAVA";
};
type opmodeGroup = { groupName: string; opmodes: opmode[]; active: boolean };
const stoppedOpmode = {
  flavor: "AUTONOMOUS",
  group: "$$$$$$$",
  name: "$Stop$Robot$",
} as opmode;

const Proxy = () => {
  const [gamepad1, setGamepad1] = useState<number | null>(null);
  const [gamepad2, setGamepad2] = useState<number | null>(null);
  const [kbController, setKbController] = useState<controller>({
    ...emptyController,
    index: 5,
  });
  const [opmodes, setOpmodes] = useState<opmodeGroup[]>([]);
  const [robotStatus, setRobotStatus] = useState<robotStatus | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [wsStatus, setWsStatus] = useState(false);
  const [watcherCount, setWatcherCount] = useState<number | null>(null);
  const [showingFilter, setShowingFilter] = useState(false);

  const opmodeFormik = useFormik({
    validationSchema: opmodeValidationSchema,
    onSubmit: (values) => {
      console.log(values);
      ws?.send(
        JSON.stringify({
          type: "INIT_OPMODE",
          opModeName: values.selectedOpmode,
        })
      );
    },
    initialValues: {
      selectedOpmode: "$Stop$Robot$",
    },
    validateOnMount: false,
  });
  const roomCodeFormik = useFormik({
    validationSchema: roomCodeValidationSchema,
    onSubmit: (values) => {
      ws?.send(JSON.stringify({ type: "joinroom", roomcode: values.roomCode }));
      console.log(values.roomCode);
    },
    initialValues: {
      roomCode: "",
    },
  });

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
            setGamepad1(null);
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
    var lastOpMode = "$Stop$Robot$";
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
        case "SEND_STATUS":
          setRobotStatus(data);
          if (data.activeOpMode && data.activeOpMode !== lastOpMode) {
            lastOpMode = data.activeOpMode;
            opmodeFormik.setFieldValue("selectedOpmode", data.activeOpMode);
          }
          break;
        case "opmodes":
          const groups = groupBy(
            data.value as opmode[],
            (opmode) => opmode.group
          );
          setOpmodes(
            map(groups, (opmodes, groupName) => ({
              groupName,
              opmodes,
              active: true,
            }))
          );
          break;
        case "disconnect":
          setOpmodes([]);
          setWatcherCount(null);
          setRobotStatus(null);
          roomCodeFormik.setFieldValue("roomCode", "");
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

  return (
    <div>
      <Container fluid className="d-grid h-100">
        {!watcherCount ? (
          <Form
            noValidate
            onSubmit={roomCodeFormik.handleSubmit}
            className="text-center p-3 w-100"
          >
            <Form.Group className="mb-3" controlId="formRoomCode">
              <Form.Label>Room Code</Form.Label>
              <Form.Control
                disabled={!wsStatus}
                type="number"
                name="roomCode"
                placeholder="000000"
                value={roomCodeFormik.values.roomCode}
                isInvalid={roomCodeFormik.errors.roomCode != undefined}
                onChange={roomCodeFormik.handleChange}
              />
              <Form.Control.Feedback type="invalid">
                {roomCodeFormik.errors.roomCode}
              </Form.Control.Feedback>
            </Form.Group>
            <div className="d-grid">
              <Button
                className={!wsStatus ? "disabled" : ""}
                variant="primary"
                type="submit"
              >
                Submit
              </Button>
            </div>
          </Form>
        ) : (
          <Container fluid className="d-grid h-100">
            <Modal show={showingFilter} onHide={() => setShowingFilter(false)}>
              <Modal.Header closeButton>
                <Modal.Title>Modal heading</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                Woohoo, you're reading this text in a modal!
              </Modal.Body>
              <Modal.Footer>
                <Button
                  variant="secondary"
                  onClick={() => setShowingFilter(false)}
                >
                  Close
                </Button>
                <Button
                  variant="primary"
                  onClick={() => setShowingFilter(false)}
                >
                  Save Changes
                </Button>
              </Modal.Footer>
            </Modal>
            {/* START */}
            <Form
              onSubmit={opmodeFormik.handleSubmit}
              className="text-center p-3 w-100"
            >
              <FloatingLabel className="mb-3" label="Select Opmode">
                <Form.Select
                  isInvalid={opmodeFormik.errors.selectedOpmode != undefined}
                  name="selectedOpmode"
                  onChange={(e) => {
                    opmodeFormik.handleChange(e);
                    console.log(opmodeFormik.values);
                  }}
                  value={opmodeFormik.values.selectedOpmode}
                  disabled={opmodes === undefined}
                >
                  <option value="$Stop$Robot$">None</option>
                  {opmodes.map((group) => (
                    <optgroup
                      label={
                        group.groupName === stoppedOpmode.group
                          ? "Default"
                          : group.groupName
                      }
                      key={group.groupName}
                    >
                      {group.opmodes.map((opmode) => (
                        <option value={opmode.name} key={opmode.name}>
                          {opmode.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {opmodeFormik.errors.selectedOpmode}
                </Form.Control.Feedback>
              </FloatingLabel>
              {(robotStatus === null ||
                robotStatus?.opModeName === "$Stop$Robot$") && (
                <Button variant="primary" type="submit" className="w-100">
                  Init
                </Button>
              )}
            </Form>
            {robotStatus !== null &&
              robotStatus?.opModeName !== "$Stop$Robot$" && (
                <Row>
                  {robotStatus?.status !== "STOPPED" ? (
                    <Button
                      variant={
                        robotStatus?.status === "RUNNING" ? "danger" : "success"
                      }
                      onClick={() => {
                        ws!.send(
                          JSON.stringify({
                            type: `${
                              robotStatus?.status === "RUNNING"
                                ? "STOP"
                                : "START"
                            }_OPMODE`,
                          })
                        );
                      }}
                    >
                      {robotStatus?.status === "RUNNING" ? "Stop" : "Start"}
                    </Button>
                  ) : (
                    <Button variant="danger" disabled>
                      STOPPED
                    </Button>
                  )}
                </Row>
              )}
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
      </Container>
    </div>
  );
};

export default Proxy;

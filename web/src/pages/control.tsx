import {
  Alert,
  Button,
  Container,
  Form,
  Row,
  Col,
  Modal,
  FloatingLabel,
  Card,
} from "react-bootstrap";
import * as Yup from "yup";
import { useFormik } from "formik";
import React, { useState, useEffect } from "react";
import { controller, emptyController } from "../shared/controller";
import { groupBy, last, map } from "lodash";
import RoomCodeForm from "../components/RoomCodeForm";
import OpmodeForm from "../components/OpmodeForm";
import ServerData from "../components/ServerData";
import OpmodesFilter from "../components/OpmodesFilter";

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

const Proxy = () => {
  const [gamepad1, setGamepad1] = useState<number | null>(null);
  const [gamepad2, setGamepad2] = useState<number | null>(null);
  const [filter, setFilter] = useState<filter>({
    flavor: { TELEOP: false, AUTONOMOUS: false },
    groups: [],
  });
  const [kbController, setKbController] = useState<controller>({
    ...emptyController,
    index: 5,
  });
  const [opmodes, setOpmodes] = useState<opmodeGroup[]>([]);
  const [robotStatus, setRobotStatus] = useState<robotStatus | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [showingFilter, setShowingFilter] = useState(false);

  const opmodeFormik = useFormik({
    validationSchema: opmodeValidationSchema,
    onSubmit: (values) => {
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
    ws.addEventListener("message", function (event) {
      if (window.localStorage.getItem("filter")) {
        setFilter(JSON.parse(window.localStorage.getItem("filter")!));
      }
      const data = JSON.parse(event.data);
      switch (data.type) {
        case "SEND_STATUS":
          setRobotStatus(data);
          if (data.opModeName && data.opModeName !== lastOpMode) {
            lastOpMode = data.opModeName;
            opmodeFormik.setFieldValue("selectedOpmode", data.opModeName);
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
            })).map((group) => ({
              ...group,
              groupName:
                group.groupName === "$$$$$$$" ? "Default" : group.groupName,
            }))
          );
          break;
        case "disconnect":
          setOpmodes([]);
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
    };
  }, []);

  return (
    <div>
      <Container fluid className="d-grid h-100">
        {opmodes.length === 0 ? (
          <RoomCodeForm formik={roomCodeFormik} />
        ) : (
          <Container fluid className="d-grid">
            <Row>
              <Col>
                <Card className="w-50 h-100 m-3">
                  <Card.Header as="h5" className="text-center">
                    Opmode Controls
                    <Button
                      style={{ float: "right" }}
                      variant="link"
                      onClick={() => setShowingFilter(true)}
                    >
                      <i className="icon bi-gear-wide-connected color-primary text-dark" />
                    </Button>
                  </Card.Header>
                  <Card.Body>
                    <Container fluid className="d-grid">
                      <OpmodesFilter
                        showingFilter={showingFilter}
                        setShowingFilter={setShowingFilter}
                        opmodes={opmodes}
                        initialFilter={filter}
                        applyFilter={(newFilter: filter, persist: boolean) => {
                          setShowingFilter(false);
                          setFilter(newFilter);
                          if (persist) {
                            window.localStorage.setItem(
                              "filter",
                              JSON.stringify(newFilter)
                            );
                          }
                        }}
                      />
                      <Row>
                        <OpmodeForm
                          formik={opmodeFormik}
                          opmodes={opmodes}
                          robotStatus={robotStatus}
                          filter={filter}
                        />
                      </Row>
                      {robotStatus !== null &&
                        robotStatus?.opModeName !== "$Stop$Robot$" && (
                          <Row>
                            {robotStatus?.status !== "STOPPED" ? (
                              <>
                                <Button
                                  className="w-50"
                                  variant="success"
                                  disabled={robotStatus.status === "RUNNING"}
                                  onClick={() => {
                                    ws!.send(
                                      JSON.stringify({
                                        type: "START_OPMODE",
                                      })
                                    );
                                  }}
                                >
                                  Start
                                </Button>
                                <Button
                                  className="w-50"
                                  variant="danger"
                                  onClick={() => {
                                    ws!.send(
                                      JSON.stringify({
                                        type: "STOP_OPMODE",
                                      })
                                    );
                                  }}
                                >
                                  Stop
                                </Button>
                              </>
                            ) : (
                              <Button variant="danger w-100" disabled>
                                STOPPED
                              </Button>
                            )}
                          </Row>
                        )}
                      <ServerData gamepad1={gamepad1} gamepad2={gamepad2} />
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
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
        )}
      </Container>
    </div>
  );
};

export default Proxy;

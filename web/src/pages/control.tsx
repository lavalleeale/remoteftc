import { Container, Row, Col, Toast } from "react-bootstrap";
import React, { useState, useEffect } from "react";
import { emptyController } from "../shared/controller";
import { groupBy, map } from "lodash";
import RoomCodeForm from "../components/RoomCodeForm";
import { controllerFromGamepad } from "../../helpers/controller";
import RobotLog from "../components/RobotLog";
import RobotData from "../components/RobotData";
import OpmodeControls from "../components/OpmodeControls";

const Control = () => {
  const [gamepad1, setGamepad1] = useState<number | null>(null);
  const [gamepad2, setGamepad2] = useState<number | null>(null);
  const [roomCodeError, setRoomCodeError] = useState(false);
  const [opmodes, setOpmodes] = useState<opmodeGroup[] | null>(null);
  const [robotStatus, setRobotStatus] = useState<robotStatus>({});
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [selectedOpmode, setSelectedOpmode] = useState("$Stop$Robot$");
  const [toasts, setToasts] = useState<{ message: string; time: Date }[]>([]);

  useEffect(() => {
    const removeGamepad = (e: GamepadEventInit) => {
      if (gamepad1 === e.gamepad.index) {
        setGamepad1(null);
        if (ws?.readyState === WebSocket.OPEN) {
          ws!.send(
            JSON.stringify({
              type: "controller",
              number: 1,
              data: { ...emptyController, updatedAt: Date.now() },
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
              data: { ...emptyController, updatedAt: Date.now() },
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
    const interval = setInterval(() => {
      [
        ...Object.values(navigator.getGamepads()).filter(
          (gamepad) => gamepad !== null
        ),
      ].forEach((gamepad) => {
        const controller = controllerFromGamepad(gamepad!);
        if (controller.start && controller.a) {
          setGamepad1(controller.index);
          if (controller.index === gamepad2) {
            if (ws?.readyState === WebSocket.OPEN) {
              ws!.send(
                JSON.stringify({
                  type: "controller",
                  number: 2,
                  data: { ...emptyController, updatedAt: Date.now() },
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
                  data: { ...emptyController, updatedAt: Date.now() },
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
                  data: { ...controller, updatedAt: Date.now() },
                })
              );
            }
          } else if (controller.index === gamepad2) {
            if (ws?.readyState === WebSocket.OPEN) {
              ws.send(
                JSON.stringify({
                  type: "controller",
                  number: 2,
                  data: { ...controller, updatedAt: Date.now() },
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
  }, [gamepad1, gamepad2, ws]);

  useEffect(() => {
    let lastStatus: robotStatus = {};
    let toasts: { message: string; time: Date }[] = [];
    let lastOpMode = "$Stop$Robot$";
    const ws = new WebSocket(
      `${
        process.env.NODE_ENV === "production"
          ? "wss://remoteftc-api.lavallee.one"
          : "ws://localhost:4000"
      }/custom`
    );
    ws.addEventListener("message", function (event) {
      const data = JSON.parse(event.data);
      switch (data.type) {
        case "telemetry":
          if (data.message.tag === "$System$Warning$") {
            lastStatus = {
              ...lastStatus,
              warningMessage: data.message.dataStrings[0].value,
            };
            setRobotStatus(lastStatus);
          } else if (data.message.tag === "$System$Error$") {
            lastStatus = {
              ...lastStatus,
              errorMessage: data.message.dataStrings[0].value,
            };
            setRobotStatus(lastStatus);
          } else {
            const log = (
              data.message.dataStrings as { key: string; value: string }[]
            )
              .filter((dataString) => dataString.key === "log")
              .map((dataString) => dataString.value);
            if (log.length !== 0) {
              setLog(log);
            }
          }
          break;
        case "activeOpmode":
          lastStatus = {
            ...lastStatus,
            status: "INIT",
            opModeName: data.value,
          };
          setRobotStatus(lastStatus);
          if (data.value !== lastOpMode) {
            lastOpMode = data.value;
            setSelectedOpmode(data.value);
          }
          break;
        case "runOpmode":
          lastStatus = {
            ...lastStatus,
            status: "RUNNING",
            opModeName: data.message,
          };
          setRobotStatus(lastStatus);
          break;
        case "toast":
          toasts = [
            { message: data.message.message, time: new Date() },
            ...toasts.slice(0, 4),
          ];
          setToasts(toasts);
          break;
        case "opmodes":
          setRoomCodeError(false);
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
          setOpmodes(null);
          setRobotStatus({});
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
      {toasts.map((toast, index) => (
        <Toast
          style={{ position: "absolute", bottom: 10 + index * 100, right: 10 }}
          onClose={() => {
            setToasts([...toasts.slice(0, index), ...toasts.slice(index + 1)]);
          }}
        >
          <Toast.Header>
            <strong className="me-auto">Message From Robot</strong>
            <small>At {toast.time.toLocaleTimeString()}</small>
          </Toast.Header>
          <Toast.Body>{toast.message}</Toast.Body>
        </Toast>
      ))}
      <Container fluid className="d-grid h-100 p-2">
        {!opmodes ? (
          <RoomCodeForm
            error={roomCodeError}
            handleRoomCode={(roomCode: string) => {
              ws?.send(
                JSON.stringify({ type: "joinroom", roomcode: roomCode })
              );
              setRoomCodeError(true);
            }}
          />
        ) : (
          <Container fluid className="d-grid">
            <Row>
              <Col>
                <OpmodeControls
                  selectedOpmode={selectedOpmode}
                  opmodes={opmodes}
                  robotStatus={robotStatus}
                  gamepad1={gamepad1}
                  gamepad2={gamepad2}
                  send={(toSend: object) => ws?.send(JSON.stringify(toSend))}
                />
              </Col>
              <Col>
                <RobotData robotStatus={robotStatus} />
              </Col>
            </Row>
            <Row className="m-3 pt-3">
              <RobotLog log={log} />
            </Row>
          </Container>
        )}
      </Container>
    </div>
  );
};

export default Control;

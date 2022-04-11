import { Button, Card, Container } from "react-bootstrap";
import React from "react";
import { useEffect, useState } from "react";
import RoomCodeForm from "../components/RoomCodeForm";
import PermissionsModal from "../components/PermissionsModal";
import {
  CommandMessage,
  GamepadMessage,
  Robot,
  RobotCommand,
  RobotEvent,
} from "robocol";

const Proxy = () => {
  const [watcherCount, setWatcherCount] = useState(0);
  const [roomCode, setRoomCode] = useState<number | string | null>(null);
  const [robotStatus, setRobotStatus] = useState(false);
  const [roomCodeError, setRoomCodeError] = useState(false);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [showingPermissions, setShowingPermissions] = useState(false);
  const [permissions, setPermissions] = useState({
    state: true,
    controller1: true,
    controller2: true,
  });

  useEffect(() => {
    var opmodeName = "$Stop$Robot$";
    var robot: Robot | null;
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
          if (!robot?.connected) {
            robot?.connect();
          }
          setRoomCode(data.value);
          setRoomCodeError(false);
          break;
        case "watcherCount":
          setWatcherCount(data.value);
          break;
        case "controller":
          if (data.number === 1) {
            if (permissions.controller1)
              robot?.send(new GamepadMessage(0, data.data, 1));
          } else {
            if (permissions.controller2)
              robot?.send(new GamepadMessage(0, data.data, 1));
          }
          break;
        case "INIT_OPMODE":
          opmodeName = data.opModeName;
          robot?.send(
            new CommandMessage(
              RobotCommand.CMD_INIT_OP_MODE,
              10,
              false,
              Date.now(),
              data.opModeName
            )
          );
          break;
        case "START_OPMODE":
          robot?.send(
            new CommandMessage(
              RobotCommand.CMD_RUN_OP_MODE,
              10,
              false,
              Date.now(),
              opmodeName
            )
          );
          break;
        case "STOP_OPMODE":
          robot?.send(
            new CommandMessage(
              RobotCommand.CMD_INIT_OP_MODE,
              10,
              false,
              Date.now(),
              "$Stop$Robot$"
            )
          );
          break;
        default:
          console.log("Unknown update", event.data);
          break;
      }
    });
    ws.addEventListener("open", () => {
      robot = new Robot();
      robot.on(RobotEvent.TELEMETRY, (message) => {
        ws.send(JSON.stringify({ type: RobotEvent.TELEMETRY, message }));
      });
      robot.on(RobotEvent.OPMODES_LIST, (message) => {
        ws.send(JSON.stringify({ type: RobotEvent.OPMODES_LIST, message }));
      });
      robot.on(RobotEvent.ACTIVE_OPMODE, (message) => {
        ws.send(JSON.stringify({ type: RobotEvent.ACTIVE_OPMODE, message }));
      });
      robot.on(RobotEvent.TOAST, (message) => {
        console.log(message);
        ws.send(JSON.stringify({ type: RobotEvent.TOAST, message }));
      });
      robot.on(RobotEvent.CONNECTION, setRobotStatus);
      robot.on(RobotEvent.RUN_OPMODE, (message) => {
        ws.send(JSON.stringify({ type: RobotEvent.RUN_OPMODE, message }));
      });
    });
    return () => {
      ws.close();
      robot?.close();
      setRobotStatus(false);
    };
  }, []);

  return (
    <Container fluid className="d-grid h-100 p-2">
      {roomCode ? (
        <Card>
          <PermissionsModal
            permissions={permissions}
            onSubmit={setPermissions}
            show={showingPermissions}
            handleClose={() => setShowingPermissions(false)}
          />
          <Card.Header as="h5" className="text-center">
            Proxy Data
            <Button
              style={{ float: "right" }}
              variant="link"
              onClick={() => setShowingPermissions(true)}
            >
              <i className="icon bi-gear-wide-connected color-primary text-dark" />
            </Button>
          </Card.Header>
          <Card.Body>
            <ul className="list-group list-group-flush">
              <li className="list-group-item">
                Room code: {roomCode || "Room code not found!"}
              </li>
              <li className="list-group-item">Watchers: {watcherCount}</li>
              <li className="list-group-item">
                Robot status: {robotStatus ? "Connected" : "Disconnected"}
              </li>
            </ul>
          </Card.Body>
        </Card>
      ) : (
        <>
          <RoomCodeForm
            handleRoomCode={function (roomCode: string): void {
              ws?.send(JSON.stringify({ type: "proxy", code: roomCode }));
              setRoomCodeError(true);
            }}
            error={roomCodeError}
          />
          <Button
            className="mt-3"
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

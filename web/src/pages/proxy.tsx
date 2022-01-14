import { Paper, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import ReconnectingWebSocket from "reconnecting-websocket";
import { emptyController } from "../shared/controller";

const Control = () => {
  const [watcherCount, setWatcherCount] = useState(0);
  const [roomCode, setRoomCode] = useState<number | null>(null);
  const [robotStatus, setRobotStatus] = useState(false);

  useEffect(() => {
    var robot: ReconnectingWebSocket | null;
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
          if (robot?.readyState === WebSocket.OPEN) {
            robot!.send(event.data);
          }
          break;
      }
    });
    ws.addEventListener("open", () => {
      ws.send("proxy");
      const ROBOT_ADDRESS = "192.168.43.1";
      robot = new ReconnectingWebSocket(`ws://${ROBOT_ADDRESS}:8000/`);
      robotControl = new ReconnectingWebSocket(`ws://${ROBOT_ADDRESS}:6969`);
      robot.addEventListener("open", function (event) {
        setRobotStatus(true);
      });
      robot.addEventListener("message", function (event) {
        ws!.send(event.data);
      });
    });
    var interval: NodeJS.Timer;
    setTimeout(() => {
      interval = setInterval(() => {
        if (robot?.readyState === WebSocket.OPEN) {
          robot!.send(JSON.stringify({ type: "GET_ROBOT_STATUS" }));
          if (robotControl?.readyState === WebSocket.OPEN) {
            robotControl.send(
              JSON.stringify({
                type: "RECEIVE_GAMEPAD_STATE",
                gamepad1: controller1,
                gamepad2: controller2,
              })
            );
          }
        }
      }, 50);
    }, 100);
    return () => {
      ws.close();
      robot?.close();
      setRobotStatus(false);
      clearInterval(interval);
    };
  }, []);

  return (
    <div>
      <Paper sx={{ ml: 10, mr: 10, p: 1 }}>
        <Typography>Room Code: {roomCode || "Room Code Not Found"}</Typography>
        <Typography>Watch Count: {watcherCount}</Typography>
        <Typography>
          Robot Status: {robotStatus ? "Connected" : "Disconnected"}
        </Typography>
      </Paper>
    </div>
  );
};

export default Control;

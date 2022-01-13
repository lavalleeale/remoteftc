import { Paper, Typography } from "@mui/material";
import { useEffect, useState } from "react";

const Control = () => {
  const [watcherCount, setWatcherCount] = useState(0);
  const [roomCode, setRoomCode] = useState<number | null>(null);
  const [robotStatus, setRobotStatus] = useState(false);

  useEffect(() => {
    var robot: WebSocket | null;
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
        default:
          if (robot?.readyState === WebSocket.OPEN) {
            robot!.send(event.data);
          }
          break;
      }
    });
    ws.addEventListener("open", () => {
      ws.send("proxy");
      robot = new WebSocket("ws://192.168.43.1:8000/");
      robot.addEventListener("open", function (event) {
        setRobotStatus(true);
      });
      robot.addEventListener("message", function (event) {
        ws!.send(event.data);
      });
    });
    const interval = setInterval(() => {
      if (robot?.readyState === WebSocket.OPEN) {
        robot!.send(JSON.stringify({ type: "GET_ROBOT_STATUS" }));
      }
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

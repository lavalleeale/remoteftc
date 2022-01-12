import { Paper, Typography } from "@mui/material";
import { useEffect, useState } from "react";

const Control = () => {
  const [robotStatus, setRobotStatus] = useState(false);
  const [watcherCount, setWatcherCount] = useState(0);
  const [roomCode, setRoomCode] = useState<number | null>(null);

  useEffect(() => {
    const ws = new WebSocket(
      `${
        process.env.NODE_ENV === "production"
          ? "wss://remoteftc-api.lavallee.one"
          : "ws://localhost:4000"
      }/custom`
    );
    const robot = new WebSocket("ws://192.168.43.1:8000/");
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
          break;
      }
    });
    robot.addEventListener("message", function (event) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(event.data);
      }
    });
    ws.addEventListener("open", () => {
      ws.send("proxy");
    });
    robot.addEventListener("open", function (event) {
      setRobotStatus(true);
    });
    return () => {
      ws.close();
      robot.close();
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

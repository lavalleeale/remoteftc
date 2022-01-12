import { Paper, Typography } from "@mui/material";
import { useEffect, useState } from "react";

const Control = () => {
  const [robotStatus, setRobotStatus] = useState(false);
  const [serverStatus, setServerStatus] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [ws, setWs] = useState<WebSocket | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [robotWs, setRobotWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(
      `${
        process.env.NODE_ENV === "production"
          ? "wss://remoteftc.lavallee.one"
          : "ws://localhost:4000"
      }/custom`
    );
    const robot = new WebSocket("ws://192.168.43.1:8000/");
    ws.addEventListener("message", function (event) {
      console.log("Message from server ", event.data);
    });
    robot.addEventListener("message", function (event) {
      console.log("Message from robot ", JSON.parse(event.data));
    });
    ws.addEventListener("open", () => {
      setServerStatus(true);
      ws.send("proxy");
    });
    robot.addEventListener("open", function (event) {
      setRobotStatus(true);
    });
    setWs(ws);
    setRobotWs(robot);
    return () => {
      ws.close();
      robot.close();
      setRobotWs(null);
      setWs(null);
    };
  }, []);

  return (
    <div>
      <Paper sx={{ ml: 10, mr: 10, p: 1 }}>
        <Typography>
          Server Status: {serverStatus ? "Connected" : "Disconnected"}
        </Typography>
        <Typography>
          Robot Status: {robotStatus ? "Connected" : "Disconnected"}
        </Typography>
      </Paper>
    </div>
  );
};

export default Control;

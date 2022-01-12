import { Paper, Typography } from "@mui/material";
import { useState, useEffect } from "react";

const Proxy = () => {
  const [gamepad1, setGamepad1] = useState<number | null>(null);
  const [gamepad2, setGamepad2] = useState<number | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    const removeGamepad = (e: GamepadEventInit) => {
      if (gamepad1 === e.gamepad.index) {
        setGamepad1(null);
      } else if (gamepad2 === e.gamepad.index) {
        setGamepad2(null);
      }
    };
    window.addEventListener("gamepaddisconnected", removeGamepad, false);
    return () => {
      window.removeEventListener("gamepaddisconnected", removeGamepad, false);
    };
  }, [gamepad1, gamepad2]);

  useEffect(() => {
    const interval = setInterval(() => {
      Object.values(navigator.getGamepads()).forEach((gamepad) => {
        if (gamepad) {
          if (gamepad.buttons[9].pressed && gamepad.buttons[0].pressed) {
            if (gamepad.index === gamepad2) {
              setGamepad2(null);
            }
            setGamepad1(gamepad.index);
          } else if (gamepad.buttons[9].pressed && gamepad.buttons[1].pressed) {
            if (gamepad.index === gamepad1) {
              setGamepad1(null);
            }
            setGamepad2(gamepad.index);
          } else {
            console.log(ws?.OPEN);
            if (ws) {
              ws.send("d");
            }
            console.log(
              Object.values(navigator.getGamepads()).find(
                (gamepad) => gamepad?.index === gamepad2
              )?.buttons
            );
          }
        }
      });
    }, 100);
    return () => {
      clearInterval(interval);
    };
  }, [gamepad1, gamepad2, ws]);

  useEffect(() => {
    const ws = new WebSocket(
      `${
        process.env.NODE_ENV === "production"
          ? "wss://remoteftc-api.lavallee.one"
          : "ws://localhost:4000"
      }/custom`
    );
    ws.addEventListener("open", function (event) {
      console.log("test");
    });
    setWs(ws);
    return () => {
      ws.close();
      setWs(null);
    };
  }, []);

  return (
    <div>
      <Paper sx={{ ml: 10, mr: 10, p: 1 }}>
        <Typography>
          {`Gamepad1: ${
            Object.values(navigator.getGamepads()).find(
              (gamepad) => gamepad?.index === gamepad1
            )?.id || "Gamepad 1 Not Connected"
          }`}
        </Typography>
        <Typography>
          {`Gamepad2: ${
            Object.values(navigator.getGamepads()).find(
              (gamepad) => gamepad?.index === gamepad2
            )?.id || "Gamepad 2 Not Connected"
          }`}
          {}
        </Typography>
      </Paper>
    </div>
  );
};

export default Proxy;

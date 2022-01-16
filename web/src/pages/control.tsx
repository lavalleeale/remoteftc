import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState, useEffect } from "react";
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
    var hasOpmode = false;
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
          if (!hasOpmode) {
            setSelectedOpmode(data.status?.activeOpMode);
            hasOpmode = true;
          }
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

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    ws?.send(JSON.stringify({ type: "joinroom", roomcode: roomCode }));
  }

  function initOpmode(e: React.FormEvent) {
    e.preventDefault();
    ws?.send(
      JSON.stringify({ type: "INIT_OP_MODE", opModeName: selectedOpmode })
    );
  }

  return (
    <div>
      <Paper sx={{ ml: 10, mr: 10, p: 1 }}>
        {!watcherCount ? (
          <form onSubmit={onSubmit}>
            <TextField
              label="Room Code"
              required
              disabled={!wsStatus}
              type="number"
              value={roomCode}
              error={roomCode.toString().length !== 6}
              helperText={
                roomCode.toString().length !== 6 && "Must Be Exactly 6 Digits"
              }
              onChange={(e) => setRoomCode(parseInt(e.target.value, 10))}
            />
            <Button
              type="submit"
              variant="contained"
              sx={{ m: 1 }}
              disabled={!wsStatus}
            >
              Submit
            </Button>
          </form>
        ) : (
          <>
            <form onSubmit={initOpmode}>
              <FormControl
                disabled={
                  opmodes === undefined ||
                  robotStatus?.activeOpMode !== "$Stop$Robot$"
                }
                sx={{ width: "50%" }}
              >
                <InputLabel id="opmode-select-label">Opmode</InputLabel>
                <Select
                  labelId="opmode-select-label"
                  id="opmode-select"
                  value={selectedOpmode}
                  label="Opmode"
                  onChange={(e) => {
                    setSelectedOpmode(e.target.value);
                  }}
                >
                  {[...(opmodes || []), "$Stop$Robot$"].map((opmode) => (
                    <MenuItem value={opmode} key={opmode}>
                      {opmode === "$Stop$Robot$" ? "None" : opmode}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {robotStatus === null ||
              robotStatus?.activeOpMode === "$Stop$Robot$" ? (
                <Button
                  type="submit"
                  variant="contained"
                  sx={{ m: 1 }}
                  disabled={
                    selectedOpmode === "$Stop$Robot$" || opmodes === undefined
                  }
                >
                  Init
                </Button>
              ) : (
                <>
                  {robotStatus.activeOpModeStatus !== "STOPPED" ? (
                    <Button
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
                      variant="contained"
                      sx={{ m: 1 }}
                      color={
                        robotStatus?.activeOpModeStatus === "RUNNING"
                          ? "error"
                          : "success"
                      }
                    >
                      {robotStatus?.activeOpModeStatus === "RUNNING"
                        ? "stop"
                        : "start"}
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      sx={{ m: 1 }}
                      color="error"
                      disabled
                    >
                      STOPPED
                    </Button>
                  )}
                </>
              )}
            </form>
            <Typography>Watch Count: {watcherCount}</Typography>
            <Typography>
              {`Gamepad1: ${
                gamepad1 === 5
                  ? "Keyboard"
                  : Object.values(navigator.getGamepads()).find(
                      (gamepad) => gamepad?.index === gamepad1
                    )?.id || "Gamepad 1 Not Connected"
              }`}
            </Typography>
            <Typography>
              {`Gamepad2: ${
                gamepad2 === 5
                  ? "Keyboard"
                  : Object.values(navigator.getGamepads()).find(
                      (gamepad) => gamepad?.index === gamepad2
                    )?.id || "Gamepad 2 Not Connected"
              }`}
            </Typography>
            {robotStatus?.warningMessage && (
              <Typography color="orange" sx={{ fontWeight: "bold" }}>
                Warning: {robotStatus?.warningMessage}
              </Typography>
            )}
            {robotStatus?.errorMessage && (
              <Typography color="error" sx={{ fontWeight: "bold" }}>
                Error: {robotStatus?.errorMessage}
              </Typography>
            )}
          </>
        )}
      </Paper>
    </div>
  );
};

export default Proxy;

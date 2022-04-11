type robotState =
  | "Unknown"
  | "NOT_STARTED"
  | "INIT"
  | "RUNNING"
  | "STOPPED"
  | "EMERGENCY_STOP";
type robotStatus = {
  opModeName?: string;
  status?: robotState;
  errorMessage?: string;
  warningMessage?: string;
};
type opmode = {
  flavor: "TELEOP" | "AUTONOMOUS";
  group: string;
  name: string;
  source: undefined | "ANDROID_STUDIO" | "BLOCKLY" | "ONBOTJAVA";
};
type opmodeGroup = { groupName: string; opmodes: opmode[]; active: boolean };
type filter = {
  flavor: {
    AUTONOMOUS: boolean;
    TELEOP: boolean;
  };
  groups: string[];
};

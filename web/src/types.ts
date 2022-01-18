type robotStatus = {
  opModeName: string;
  status: "RUNNING" | "INIT" | "STOPPED";
  errorMessage: string;
  warningMessage: string;
  state: string;
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

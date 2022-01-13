import { DeviceHub, SportsEsports } from "@mui/icons-material";
import { AppBar, Toolbar, Typography, IconButton } from "@mui/material";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <AppBar position="relative" sx={{ marginBottom: 1 }}>
      <Toolbar>
        <Link to="/" style={{ flexGrow: 1 }}>
          <Typography>Remote FTC Control</Typography>
        </Link>
        {navigator.userAgent.match("Electron") && (
          <Link to="/proxy">
            <IconButton>
              <DeviceHub />
            </IconButton>
          </Link>
        )}
        <Link to="/control">
          <IconButton>
            <SportsEsports />
          </IconButton>
        </Link>
      </Toolbar>
    </AppBar>
  );
};

export default Header;

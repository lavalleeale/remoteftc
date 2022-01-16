import React from "react";
import { Nav, Navbar, Offcanvas, Container } from 'react-bootstrap'

const Header = () => {
  return (
    <Navbar bg="dark" variant="dark">
      <Container fluid>
        <Navbar.Brand href="/">
          <img
            alt=""
            src="./assets/images/logo.svg"
            width="30"
            height="30"
            className="d-inline-block align-top"
            color="white"
            />{' '}
          Remote FTC
        </Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse id="navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="/control">Control</Nav.Link>
            {navigator.userAgent.match("Electron") && (
              <Nav.Link href="/proxy">Proxy</Nav.Link>
            )}
          </Nav>
          <Nav>
            <Nav.Link href="https://github.com/lavalleeale/remoteftc">Github</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;

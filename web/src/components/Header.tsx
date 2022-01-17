import React from "react";
import { Nav, Navbar, Offcanvas, Container } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'

const Header = () => {
  return (
    <Navbar bg="dark" variant="dark">
      <Container fluid>
        <LinkContainer to="/">
          <Navbar.Brand>
            <img
              alt=""
              src="./logo.svg"
              width="30"
              height="30"
              className="d-inline-block align-top"
              color="white"
              />{' '}
            Remote FTC
          </Navbar.Brand>
        </LinkContainer>
        <Navbar.Toggle />
        <Navbar.Collapse id="navbar-nav">
          <Nav className="me-auto">
            <LinkContainer to="/control"><Nav.Link>Control</Nav.Link></LinkContainer>
            {navigator.userAgent.match("Electron") && (
              <LinkContainer to="/proxy"><Nav.Link>Proxy</Nav.Link></LinkContainer>
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

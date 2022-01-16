import React from "react";
import {
  Container,
  Col,
  Row,
  Button
} from 'react-bootstrap'

const Home = () => {
  return (
    <body>
      <div id="content" className= "index-head mb-3">
        <Container className="px-4 px-md-3">
          <Row className="align-items-center">
            <Col className="text-center text-md-start">
              <h1 className="mb-3">Remote FTC</h1>
              <p className="lead mb-4">
                Host and participate in low latency FTC driver practices from the comfort and safety of your home.
              </p>
              <Button variant="primary" href="https://github.com/lavalleeale/remoteftc" size="lg">Get started</Button>
            </Col>
          </Row>
        </Container>
      </div>
    </body>
  );
};

export default Home;

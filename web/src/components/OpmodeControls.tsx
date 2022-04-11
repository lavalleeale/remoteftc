import React, { useEffect, useState } from "react";
import { Card, Button, Container, Row } from "react-bootstrap";
import OpmodeForm from "./OpmodeForm";
import OpmodesFilter from "./OpmodesFilter";
import ServerData from "./ServerData";

const OpmodeControls = ({
  opmodes,
  robotStatus,
  gamepad1,
  gamepad2,
  send,
  selectedOpmode,
}: {
  opmodes: opmodeGroup[];
  robotStatus: robotStatus;
  gamepad1: number | null;
  gamepad2: number | null;
  send: (arg0: object) => void;
  selectedOpmode: string;
}) => {
  const [showingFilter, setShowingFilter] = useState(false);
  const [filter, setFilter] = useState<filter>({
    flavor: { TELEOP: false, AUTONOMOUS: false },
    groups: [],
  });
  useEffect(() => {
    if (window.localStorage.getItem("filter")) {
      setFilter(JSON.parse(window.localStorage.getItem("filter")!));
    }
  }, []);

  return (
    <Card className="w-100 h-100 m-3">
      <Card.Header as="h5" className="text-center">
        Opmode Controls
        <Button
          style={{ float: "right" }}
          variant="link"
          onClick={() => setShowingFilter(true)}
        >
          <i className="icon bi-gear-wide-connected color-primary text-dark" />
        </Button>
      </Card.Header>
      <Card.Body>
        <Container fluid className="d-grid">
          <OpmodesFilter
            showingFilter={showingFilter}
            setShowingFilter={setShowingFilter}
            opmodes={opmodes}
            initialFilter={filter}
            applyFilter={(newFilter: filter, persist: boolean) => {
              setShowingFilter(false);
              setFilter(newFilter);
              if (persist) {
                window.localStorage.setItem(
                  "filter",
                  JSON.stringify(newFilter)
                );
              }
            }}
          />
          <Row>
            <OpmodeForm
              send={send}
              opmodes={opmodes}
              robotStatus={robotStatus}
              filter={filter}
              selectedOpmode={selectedOpmode}
            />
          </Row>
          {robotStatus?.opModeName &&
            robotStatus.opModeName !== "$Stop$Robot$" && (
              <Row>
                {robotStatus?.status !== "STOPPED" ? (
                  <>
                    <Button
                      className="w-50"
                      variant="success"
                      disabled={robotStatus.status === "RUNNING"}
                      onClick={() => {
                        send({
                          type: "START_OPMODE",
                        });
                      }}
                    >
                      Start
                    </Button>
                    <Button
                      className="w-50"
                      variant="danger"
                      onClick={() => {
                        send({
                          type: "STOP_OPMODE",
                        });
                      }}
                    >
                      Stop
                    </Button>
                  </>
                ) : (
                  <Button variant="danger w-100" disabled>
                    STOPPED
                  </Button>
                )}
              </Row>
            )}
          <ServerData gamepad1={gamepad1} gamepad2={gamepad2} />
        </Container>
      </Card.Body>
    </Card>
  );
};

export default OpmodeControls;

import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

const OpmodesFilter = ({
  showingFilter,
  setShowingFilter,
  opmodes,
  applyFilter,
  initialFilter,
}: {
  showingFilter: boolean;
  setShowingFilter: (_: boolean) => void;
  opmodes: opmodeGroup[];
  applyFilter: (_: filter, persist: boolean) => void;
  initialFilter: filter;
}) => {
  const [filter, setFilter] = useState<filter>(initialFilter);
  return (
    <Modal show={showingFilter} onHide={() => setShowingFilter(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Opmodes Settings</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          Modes
          <Form.Check
            type="switch"
            id="teleop-switch"
            label="Teleop"
            checked={!filter.flavor.TELEOP}
            onChange={(e) =>
              setFilter({
                ...filter,
                flavor: { ...filter.flavor, TELEOP: !e.target.checked },
              })
            }
          />
          <Form.Check
            type="switch"
            id="auto-switch"
            label="Autonomous"
            checked={!filter.flavor.AUTONOMOUS}
            onChange={(e) =>
              setFilter({
                ...filter,
                flavor: { ...filter.flavor, AUTONOMOUS: !e.target.checked },
              })
            }
          />
          Groups
          {opmodes.map((group) => (
            <Form.Check
              type="switch"
              id={`${group.groupName}-group-switch`}
              label={group.groupName}
              key={group.groupName}
              onChange={(e) => {
                if (e.target.checked) {
                  setFilter({
                    ...filter,
                    groups: filter.groups.filter(
                      (checkGroup) => checkGroup !== group.groupName
                    ),
                  });
                } else {
                  setFilter({
                    ...filter,
                    groups: [...filter.groups, group.groupName],
                  });
                }
              }}
              checked={!filter.groups.includes(group.groupName)}
            />
          ))}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={() => applyFilter(filter, false)}>
          Apply Temporarily
        </Button>
        <Button onClick={() => applyFilter(filter, true)}>
          Save Permanently
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default OpmodesFilter;

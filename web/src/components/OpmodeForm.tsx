import { FormikErrors } from "formik";
import React from "react";
import { Form, FloatingLabel, Button, Row } from "react-bootstrap";

const stoppedOpmode = {
  flavor: "AUTONOMOUS",
  group: "$$$$$$$",
  name: "$Stop$Robot$",
} as opmode;

const OpmodeForm = ({
  formik,
  opmodes,
  robotStatus,
}: {
  formik: {
    handleChange: (e: React.ChangeEvent<any>) => void;
    handleSubmit: (e?: React.FormEvent<HTMLFormElement> | undefined) => void;
    values: { selectedOpmode: string };
    errors: FormikErrors<{ selectedOpmode: string }>;
  };
  opmodes: opmodeGroup[];
  robotStatus: robotStatus | null;
}) => {
  return (
    <Form
      onSubmit={formik.handleSubmit}
      className="text-center w-100 p-0 mb-3 pt-3 d-flex"
    >
      <FloatingLabel
        className={
          robotStatus === null || robotStatus?.opModeName === "$Stop$Robot$"
            ? "w-75"
            : "w-100"
        }
        label="Select Opmode"
      >
        <Form.Select
          isInvalid={formik.errors.selectedOpmode != undefined}
          name="selectedOpmode"
          onChange={formik.handleChange}
          value={formik.values.selectedOpmode}
          disabled={opmodes === undefined}
        >
          <option value="$Stop$Robot$">None</option>
          {opmodes.map((group) => (
            <optgroup
              label={
                group.groupName === stoppedOpmode.group
                  ? "Default"
                  : group.groupName
              }
              key={group.groupName}
            >
              {group.opmodes.map((opmode) => (
                <option value={opmode.name} key={opmode.name}>
                  {opmode.name}
                </option>
              ))}
            </optgroup>
          ))}
        </Form.Select>
        <Form.Control.Feedback type="invalid">
          {formik.errors.selectedOpmode}
        </Form.Control.Feedback>
      </FloatingLabel>
      {(robotStatus === null || robotStatus?.opModeName === "$Stop$Robot$") && (
        <Button
          className="w-25"
          style={{ height: "calc(3.5rem + 2px)" }}
          variant="primary"
          type="submit"
        >
          Init
        </Button>
      )}
    </Form>
  );
};

export default OpmodeForm;

import { Formik } from "formik";
import * as Yup from "yup";
import React from "react";
import { Form, FloatingLabel, Button, Row } from "react-bootstrap";

function applyFilter(groups: opmodeGroup[], filter: filter) {
  return groups
    .map((group) => ({
      ...group,
      opmodes: group.opmodes.filter((opmode) => !filter.flavor[opmode.flavor]),
    }))
    .filter(
      (group) =>
        group.opmodes.length !== 0 && !filter.groups.includes(group.groupName)
    );
}

const opmodeValidationSchema = Yup.object().shape({
  selectedOpmode: Yup.string()
    .required("A valid Opmode must be selected")
    .notOneOf(["", "$Stop$Robot$"], "A valid Opmode must be selected"),
});

const OpmodeForm = ({
  opmodes,
  robotStatus,
  filter,
  send,
  selectedOpmode,
}: {
  opmodes: opmodeGroup[];
  robotStatus: robotStatus | null;
  filter: filter;
  send: (arg0: object) => void;
  selectedOpmode: string;
}) => {
  return (
    <Formik
      validationSchema={opmodeValidationSchema}
      onSubmit={(values) => {
        send({
          type: "INIT_OPMODE",
          opModeName: values.selectedOpmode,
        });
      }}
      initialValues={{
        selectedOpmode: "$Stop$Robot$",
      }}
      validateOnMount={false}
    >
      {({ handleSubmit, errors, handleChange, values, setFieldValue }) => {
        React.useEffect(() => {
          if (selectedOpmode !== values.selectedOpmode) {
            setFieldValue("selectedOpmode", selectedOpmode);
          }
        }, [selectedOpmode]);

        return (
          <Form
            onSubmit={handleSubmit}
            className="text-center w-100 p-0 mb-3 pt-3 d-flex"
          >
            <FloatingLabel
              className={
                robotStatus?.opModeName === undefined ||
                robotStatus.opModeName === "$Stop$Robot$"
                  ? "w-75"
                  : "w-100"
              }
              label="Select Opmode"
            >
              <Form.Select
                isInvalid={errors.selectedOpmode != undefined}
                name="selectedOpmode"
                onChange={handleChange}
                value={values.selectedOpmode}
                disabled={opmodes === undefined}
              >
                <option value="$Stop$Robot$">None</option>
                {applyFilter(opmodes, filter).map((group) => (
                  <optgroup label={group.groupName} key={group.groupName}>
                    {group.opmodes.map((opmode) => (
                      <option value={opmode.name} key={opmode.name}>
                        {opmode.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {errors.selectedOpmode}
              </Form.Control.Feedback>
            </FloatingLabel>
            {(robotStatus?.opModeName === undefined ||
              robotStatus.opModeName === "$Stop$Robot$") && (
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
      }}
    </Formik>
  );
};

export default OpmodeForm;

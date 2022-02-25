import { Formik, FormikValues } from "formik";
import React from "react";
import { Button, Form, Modal } from "react-bootstrap";

const PermissionsModal = ({
  show,
  handleClose,
  onSubmit,
  permissions,
}: {
  permissions: {
    controller1: boolean;
    controller2: boolean;
    state: boolean;
  };
  show: boolean;
  handleClose(): void;
  onSubmit(e: {
    controller1: boolean;
    controller2: boolean;
    state: boolean;
  }): void;
}) => {
  4;
  return (
    <Modal show={show} onHide={handleClose}>
      <Formik initialValues={permissions} onSubmit={onSubmit}>
        {({ values, handleChange, handleSubmit }) => (
          <Form
            noValidate
            onSubmit={handleSubmit}
            className="text-center w-100"
          >
            <Modal.Header closeButton>
              <Modal.Title>Permissions Settings</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form.Check
                type="switch"
                id="state"
                label="Change State"
                checked={values.state}
                onChange={handleChange}
              />
              <Form.Check
                type="switch"
                id="controller1"
                label="Controller 1"
                checked={values.controller1}
                onChange={handleChange}
              />
              <Form.Check
                type="switch"
                id="controller2"
                label="Controller 2"
                checked={values.controller2}
                onChange={handleChange}
              />
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleClose}>
                Close Without Saving
              </Button>
              <Button variant="primary" type="submit" onClick={handleClose}>
                Save Changes
              </Button>
            </Modal.Footer>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};

export default PermissionsModal;

import { FormikConfig, FormikErrors, FormikValues } from "formik";
import React from "react";
import { Button, Form } from "react-bootstrap";

const RoomCodeForm = ({
  formik,
}: {
  formik: {
    handleChange: (e: React.ChangeEvent<any>) => void;
    handleSubmit: (e?: React.FormEvent<HTMLFormElement> | undefined) => void;
    values: { roomCode: string };
    errors: FormikErrors<{ roomCode: string }>;
  };
}) => {
  return (
    <Form
      noValidate
      onSubmit={formik.handleSubmit}
      className="text-center p-3 w-100"
    >
      <Form.Group className="mb-3" controlId="formRoomCode">
        <Form.Label>Room Code</Form.Label>
        <Form.Control
          type="number"
          name="roomCode"
          placeholder="000000"
          value={formik.values.roomCode}
          isInvalid={formik.errors.roomCode != undefined}
          onChange={formik.handleChange}
        />
        <Form.Control.Feedback type="invalid">
          {formik.errors.roomCode}
        </Form.Control.Feedback>
      </Form.Group>
      <div className="d-grid">
        <Button variant="primary" type="submit">
          Submit
        </Button>
      </div>
    </Form>
  );
};

export default RoomCodeForm;

import { Formik, FormikConfig, FormikErrors, FormikValues } from "formik";
import React from "react";
import { Button, Form } from "react-bootstrap";
import * as Yup from "yup";

const roomCodeValidationSchema = Yup.object().shape({
  roomCode: Yup.string().required("Please enter a room code"),
});

const RoomCodeForm = ({
  handleRoomCode,
  error,
}: {
  handleRoomCode(roomCode: string): void;
  error: boolean;
}) => {
  const [prevCodes, setPrevCodes] = React.useState<string[] | null>(null);
  React.useEffect(() => {
    const codes = localStorage.getItem("prevCodes");
    if (codes) {
      setPrevCodes(JSON.parse(codes));
    } else {
      setPrevCodes([]);
    }
  }, []);

  return (
    <Formik
      validationSchema={roomCodeValidationSchema}
      initialValues={{ roomCode: "" }}
      onSubmit={(e) => {
        if (prevCodes?.indexOf(e.roomCode) === -1) {
          setPrevCodes([e.roomCode, ...prevCodes!].slice(0, 5));
          localStorage.setItem(
            "prevCodes",
            JSON.stringify([e.roomCode, ...prevCodes!].slice(0, 5))
          );
        }
        handleRoomCode(e.roomCode);
      }}
    >
      {({ values, errors, handleChange, handleSubmit }) => (
        <Form noValidate onSubmit={handleSubmit} className="text-center w-100">
          <Form.Group className="mb-3" controlId="formRoomCode">
            <Form.Label>Room Code</Form.Label>
            <Form.Control
              name="roomCode"
              value={values.roomCode}
              isInvalid={errors.roomCode != undefined || error}
              onChange={handleChange}
            />
            <Form.Control.Feedback type="invalid">
              {errors.roomCode || "Invalid Room Code"}
            </Form.Control.Feedback>
          </Form.Group>
          <Button variant="primary" type="submit" className="w-100">
            Submit
          </Button>
          {prevCodes && prevCodes.length > 0 && (
            <div className="text-start">
              Previous Codes
              <ul>
                {prevCodes.map((code) => (
                  <li key={code}>
                    <a href="javascript:" onClick={() => handleRoomCode(code)}>
                      {code}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Form>
      )}
    </Formik>
  );
};

export default RoomCodeForm;

import React, { useState } from "react";
import { Button, Form, Modal, Spinner } from "react-bootstrap";
const low = window.require("lowdb");
const FileSync = window.require("lowdb/adapters/FileSync");

const AddTaskModal = (props) => {
  const adapter = new FileSync("db.json");
  const db = low(adapter);
  const [isLoading, setIsLoading] = useState(false);
  const [address, setAddress] = useState("");

  const handleChange = (event) => {
    setAddress(event.target.value);
  };

  const makeId = (length) => {
    var result = "";
    var characters = "abcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  };

  const addTask = async (event) => {
    if (address.length !== 0) {
      setIsLoading(true);
      event.preventDefault();
      await db
        .get("tasks")
        .push({
          id: makeId(16),
          address: address,
          status: "0",
          transferRate: "0",
          lastTry: "",
          createdAt: Date.now(),
        })
        .write();
      setAddress("");
      setIsLoading(false);
      props.onHide();
    }
  };

  return (
    <Modal
      {...props}
      size="md"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Form onSubmit={addTask}>
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            Add New Download
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="formBasicEmail">
            <Form.Label>Address</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter Address of the file"
              value={address}
              onChange={handleChange}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-default" onClick={props.onHide}>
            Close
          </Button>
          <Button variant="outline-success" type="submit">
            {isLoading ? (
              <Spinner
                as="span"
                animation="grow"
                size="sm"
                role="status"
                aria-hidden="true"
              />
            ) : (
              <span />
            )}
            Submit
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AddTaskModal;

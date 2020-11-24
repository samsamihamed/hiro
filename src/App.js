import React, { useEffect, useState } from "react";
import { Button, Col, Container, Row, Table } from "react-bootstrap";
import { MdAdd, MdPause, MdPlayArrow, MdRemove } from "react-icons/md";
import AddTaskModal from "./AddTask";
const { spawn } = window.require("child_process");
const low = window.require("lowdb");
const FileSync = window.require("lowdb/adapters/FileSync");

const App = () => {
  const adapter = new FileSync("db.json");
  const db = low(adapter);
  db.defaults({ tasks: [] }).write();
  const tasks = db.get("tasks");
  const [selectedTask, setSelectedTask] = useState();
  const [currentTask, setCurrentTask] = useState(null);
  const [modalShow, setModalShow] = useState(false);
  const dest = "/home/hamed/Downloads/Hiro/";

  const startDownload = (task) => {
    let fileName = task.address.replace(/^.*[\\\/]/, "");
    let link = task.address;
    const downloadCommand = spawn("axel", [
      link,
      `--output=${dest}${fileName}`,
    ]);
    downloadCommand.stdout.on("data", (data) => {
      let statusValue = /\[\s+(\d+)%\]/.exec(data);
      let transferRateValue = /([0-9]+\.[0-9]+)KB\/s\]/.exec(data);
      if (statusValue && transferRateValue) {
        let taskObject = {
          id: task.id,
          status: statusValue[1],
          transferRate: transferRateValue[1],
          pid: downloadCommand.pid,
        };
        setCurrentTask(taskObject);
      }
    });

    downloadCommand.stderr.on("data", (data) => {
      console.log(`stderr: ${data}`);
    });

    downloadCommand.on("error", (error) => {
      console.log(`error: ${error.message}`);
    });

    downloadCommand.on("close", (code) => {
      console.log(`child process exited with code ${code}`);
      if (code === 0) {
        tasks
          .find({ id: selectedTask.id })
          .assign({
            status: "100",
            transferRate: "0",
          })
          .write();
        setCurrentTask(null);
      }
    });
  };

  const pauseDownload = async () => {
    const ls = spawn("kill", [currentTask.pid]);
    await tasks
      .find({ id: selectedTask.id })
      .assign({
        status: currentTask.status,
        transferRate: currentTask.transferRate,
      })
      .write();
    setCurrentTask(null);
  };

  return (
    <React.Fragment>
      <AddTaskModal show={modalShow} onHide={() => setModalShow(false)} />
      <Container fluid className="App">
        <Row>
          <Col>
            <div className="my-4">
              <Button
                variant="outline-success"
                className="mr-2"
                onClick={() => setModalShow(true)}
              >
                <MdAdd size={28} />
                Add
              </Button>
              <Button
                variant="outline-primary"
                className="mr-2"
                onClick={() => startDownload(selectedTask)}
                disabled={!selectedTask || currentTask ? true : false}
              >
                <MdPlayArrow size={28} />
                Start
              </Button>
              <Button
                variant="outline-warning"
                className="mr-2"
                onClick={pauseDownload}
                disabled={!selectedTask || !currentTask ? true : false}
              >
                <MdPause size={28} />
                Pause
              </Button>
              <Button
                variant="outline-danger"
                className="mr-2"
                // onClick={() => setModalShow(true)}
                disabled
              >
                <MdRemove size={28} />
                Add
              </Button>
            </div>
            <Table bordered size="sm">
              <thead>
                <tr>
                  <th>#</th>
                  <th>File Name</th>
                  <th>Status</th>
                  <th>Transfer Rate</th>
                </tr>
              </thead>
              <tbody>
                {tasks.value().map((item, index) => (
                  <tr
                    key={index}
                    className={
                      selectedTask && item.id === selectedTask.id
                        ? "bg-primary"
                        : "bg-white"
                    }
                    onClick={() => setSelectedTask(item)}
                  >
                    <td>{index}</td>
                    <td>{item.address.replace(/^.*[\\\/]/, "")}</td>
                    <td>
                      {currentTask && item.id === currentTask.id
                        ? currentTask.status
                        : item.status}
                      %
                    </td>
                    <td>
                      {currentTask && item.id === currentTask.id
                        ? currentTask.transferRate
                        : item.transferRate}
                      KB/s
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Col>
        </Row>
      </Container>
    </React.Fragment>
  );
};

export default App;

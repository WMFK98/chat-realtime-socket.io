import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

function App() {
  const [socket, setSocket] = useState(null);
  const [inputUsername, setInputUsername] = useState("");
  const [username, setUsername] = useState("Anonymous");
  const [inputMessage, setInputMessage] = useState("");
  const [userTyping, setUserTyping] = useState("Anonymous");
  const [listMessage, setListMessage] = useState([]);
  const [showTyping, setShowTyping] = useState(false);
  useEffect(() => {
    const newSocket = io("http://localhost:3000");
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to server");
    });

    newSocket.on("receive_message", (data) => {
      console.log(data);
      setListMessage((list) => [...list, data]);
    });

    let timeout;
    newSocket.on("typing", (data) => {
      clearTimeout(timeout);
      setUserTyping(data.username || "Anonymous");
      setShowTyping(true);
      timeout = setTimeout(() => setShowTyping(false), 5000);
    });

    return () => newSocket.close();
  }, []);

  const handleChangeUser = async () => {
    await socket.emit("change_username", { username: inputUsername });
    setUsername(inputUsername);
    setInputUsername("");
    console.log(username);
  };

  const handleReceiveMessage = async () => {
    if (!inputMessage) return;
    await socket.emit("new_message", { message: inputMessage });
    setInputMessage("");
  };

  const handleDuringTyping = async () => {
    if (!inputMessage) return;
    console.log("typing...");
    await socket.emit("typing");
  };

  return (
    <div className="container">
      <div className="title">
        <h3>Realtime Chat Room</h3>
      </div>

      <div className="card">
        <div className="card-header">{username}</div>
        <div className="card-body">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              id="username"
              placeholder="Change your username"
              value={inputUsername}
              onChange={(e) => setInputUsername(e.target.value)}
            />
            <div className="input-group-append">
              <button
                onClick={handleChangeUser}
                className="btn btn-warning"
                type="button"
                id="usernameBtn"
              >
                Change
              </button>
            </div>
          </div>
        </div>

        <div className="message-box">
          <ul className="list-group list-group-flush" id="message-list">
            {listMessage.map(({ username, message }, i) => (
              <li className="list-group-item" key={i}>
                {username} : {message}
              </li>
            ))}
          </ul>
          <div className="info">
            {showTyping && <p>{userTyping} is typing...</p>}
          </div>
        </div>

        <div className="card-footer">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              id="message"
              value={inputMessage}
              onKeyDown={handleDuringTyping}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Send new message"
            />
            <div className="input-group-append">
              <button
                onClick={handleReceiveMessage}
                className="btn btn-success"
                type="button"
                id="messageBtn"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

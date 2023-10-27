import React, { useState, useEffect } from 'react';
import Modal from "@mui/material/Modal";
import Button from "@mui/material/Button";
import Input from "@mui/material/Input";
import { db, auth } from "../firebase";
import Posts from './Posts';
import AddPost from './AddPost';

const useStyles = {
  paper: {
    position: "absolute",
    width: 400,
    backgroundColor: "white",
    border: "2px solid #000",
    boxShadow: "5px 5px 15px 5px rgba(0, 0, 0, 0.4)",
    padding: "20px",
  },
};

function getModalStyle() {
  return {
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  };
}

function Home() {
  const [modalStyle] = useState(getModalStyle);

  const [open, setOpen] = useState(false);
  const [openSignin, setOpensignin] = useState(false);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);

  const signUp = (event) => {
    event.preventDefault();
    auth.createUserWithEmailAndPassword(email, password)
      .then((authUser) => {
        return authUser.user.updateProfile({
          displayName: username,
        });
      })
      .catch((error) => alert(error.message));

    setOpen(false);
  };

  const signIn = (event) => {
    event.preventDefault();
    auth.signInWithEmailAndPassword(email, password)
      .catch((error) => alert(error.message));

    setOpensignin(false);
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        setUser(authUser);
      } else {
        setUser(null);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    db.collection("posts")
      .orderBy("timestamp", "desc")
      .onSnapshot((snapshot) => {
        setPosts(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            post: doc.data(),
          }))
        );
      });
  }, []);

  return (
    <div className="app">
      <Modal open={open} onClose={() => setOpen(false)}>
        <div style={{ ...modalStyle, ...useStyles.paper }}>
          <form className="app__signup">
            <br />
            <Input
              placeholder="Username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <br />
            <Input
              placeholder="Email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <br />
            <Input
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <br />
            <Button type="submit" onClick={signUp}>
              Sign Up
            </Button>
          </form>
        </div>
      </Modal>

      <Modal open={openSignin} onClose={() => setOpensignin(false)}>
        <div style={{ ...modalStyle, ...useStyles.paper }}>
          <form className="app__signup">
            <center>
              <img
                className="app__headerImage"
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Instagram_logo.svg/1600px-Instagram_logo.svg.png?20160616034027"
                alt=""
                width={'180'}
                height={'60'}
              />
            </center>
            <br />
            <Input
              placeholder="Email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <br />
            <Input
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <br />
            <Button type="submit" onClick={signIn}>
              Sign In
            </Button>
          </form>
        </div>
      </Modal>

      <div className="app__header">
        <img
          className="app__headerImage"
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Instagram_logo.svg/1600px-Instagram_logo.svg.png?20160616034027"
          alt=""
          width={'180'}
          height={'60'}
        />
        {user ? (
          <div style={{ display: "flex", alignItems: 'center', justifyContent: "space-between" }}>
            <h2>Hello, {user.displayName}</h2>
            <Button variant="contained" color='primary' onClick={() => auth.signOut()}>Logout</Button>
          </div>
        ) : (
          <div>
            <Button variant="contained" color='primary' disableElevation onClick={() => setOpensignin(true)}>Sign In</Button>
            <span>&nbsp;</span>
            <Button variant="contained" color='primary' disableElevation onClick={() => setOpen(true)}>Sign Up</Button>
          </div>
        )}
      </div>

      {user && user.displayName ? (
        <AddPost username={user.displayName} />
      ) : (
        <div className='unauth'>
          Please <b onClick={() => setOpensignin(true)} style={{ cursor: 'pointer', color: 'Blue' }}>Login</b> or <b onClick={() => setOpen(true)} style={{ cursor: 'pointer', color: 'Blue' }}>Register</b> to Add New Post
        </div>
      )}

      <div className="app__posts">
        <div className="app__postright">
          {posts.map(({ id, post }) => (
            <Posts
              key={id}
              postId={id}
              user={user}
              userName={post.userName}
              caption={post.caption}
              imageURL={post.imageURL}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;

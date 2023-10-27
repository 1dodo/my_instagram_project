import React, { useState } from 'react';
import { storage, db } from "../firebase"
import { TextField, Button, LinearProgress } from '@mui/material'
import firebase from 'firebase/compat/app';
import "firebase/compat/firestore";
import 'firebase/compat/storage';

function AddPost({ username }) {
  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (image) {
      setUploading(true);

      const uploadTask = storage.ref(`images/${image.name}`).put(image);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          setProgress(progress);
        },
        (error) => {
          console.error(error);
          alert(error.message);
        },
        () => {
          storage
            .ref("images")
            .child(image.name)
            .getDownloadURL()
            .then(url => {
              db.collection("posts").add({
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                caption: caption,
                imageURL: url,
                userName: username
              })
            })
            .then(() => {
              setCaption('');
              setImage(null);
              setProgress(0);
              setUploading(false);
            })
            .catch(error => {
              console.error(error);
              alert(error.message);
            });
        }
      );
    }
  }

  return (
    <div className="imagesupload">
      <h2 style={{ textAlign: 'center', margin: '15px' }}>Add New post</h2>
      <input className='file-input' type="file" onChange={handleChange} />
      <br />
      <TextField id="filled-basic" label="Caption here" variant="filled" onChange={event => setCaption(event.target.value)} value={caption} />
      <br />
      {uploading && <LinearProgress variant="determinate" value={progress} />}
      <Button variant="contained" color='primary' onClick={handleUpload} disabled={uploading}>
        ADD POST
      </Button>
    </div>
  );
}

export default AddPost;

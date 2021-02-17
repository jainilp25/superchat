import React, { useRef, useState } from 'react';
import './App.css';

/* firebase sdk */
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/analytics';

/* hooks */
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  apiKey: "AIzaSyBv-ddcog1g0Slqk4MMh_g3T2A3pwnug0U",
  authDomain: "superchat-e183f.firebaseapp.com",
  projectId: "superchat-e183f",
  storageBucket: "superchat-e183f.appspot.com",
  messagingSenderId: "224433178781",
  appId: "1:224433178781:web:5ee682bf6f3c6dfa322c74"
})

const auth = firebase.auth();
const firestore = firebase.firestore();
const analytics = firebase.analytics();

function App() {

  const [user] = useAuthState(auth); // user is an object when signed in and null otherwise

  return (
    <div className="App">
      <header>
        <h1>Welcome to Chat!</h1>
        <SignOut />
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />} 
      </section>
    </div>
  );
}

function SignIn() {

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>Sign in with Google</button>
    </>
  )
}

function SignOut() {

  return auth.currentUser && (
    <button className="sign-out" onClick={() => auth.signOut()}>Sign Out</button>
  )
}

function ChatRoom() {

  const dummy = useRef();
  const messagesRef = firestore.collection('messages'); // reference a firestore collection
  const query = messagesRef.orderBy('createdAt').limit(25); // query documents in a collection

  const [messages] = useCollectionData(query, { idField: 'id' }); // listen to data with a hook

  const [formValue, setFormValue] = useState('');

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue('');
    // dummy.current.scrollIntoView({ behavior: 'smooth'});
  }

  return (
    <>
      <main>
        <div>
          {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
          <span ref={dummy}></span>
        </div>
      </main>

      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="Enter Message Here" />
        <button type="submit" disabled={!formValue}>Send</button>
      </form>

    </>
  )
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';
  
  return (
    <>
      <div className={`message ${messageClass}`}>
      <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} />
      <p>{text}</p>
    </div>
    </>
  )
}

export default App;

// WeTheVoice MVP Starter Repo (Web-First)
// Tech: Next.js + Firebase Auth + Node.js (Express API) + Google Civic API + SendGrid

// ------------------------------
// File: /lib/firebase.js
// Firebase initialization
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// ------------------------------
// File: /pages/register.js
// Registration page with role selector
import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('constituent');
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', userCredential.user.uid), { email, role });
      window.location.href = '/';
    } catch (err) {
      console.error(err);
      setError('Registration failed');
    }
  };

  return (
    <form onSubmit={handleRegister} style={{ padding: '2rem' }}>
      <h2>Register</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="constituent">Constituent</option>
        <option value="candidate">Candidate</option>
        <option value="official">Official</option>
      </select>
      <button type="submit">Sign Up</button>
    </form>
  );
}

// ------------------------------
// File: /pages/index.js (updated to show role)
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export default function Home() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const docSnap = await getDoc(doc(db, 'users', currentUser.uid));
        if (docSnap.exists()) setRole(docSnap.data().role);
      } else {
        setUser(null);
        setRole(null);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Welcome to WeTheVoice</h1>
      {user ? (
        <>
          <p>Logged in as {user.email} ({role})</p>
          <button onClick={() => signOut(auth)}>Sign Out</button>
          <br /><br />
          <Link href="/inquiry">Contact Your Rep</Link>
        </>
      ) : (
        <>
          <Link href="/login">Login</Link> | <Link href="/register">Register</Link>
        </>
      )}
    </div>
  );
}

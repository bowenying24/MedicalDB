import React, { useState, useEffect } from 'react';
import { AppBar, Container, Toolbar } from '@mui/material';
import { NavLink } from 'react-router-dom';
import '../css/NavBar.css'; // Import the CSS file
import { jwtDecode } from 'jwt-decode'

const NavText = ({ href, text, isMain }) => {
  const linkClass = isMain ? 'navLink navLinkMain' : 'navLink';
  const textStyle = {
    fontWeight: 'bold', // Making text bold
    textDecoration: 'none',
    marginRight: '10px'
  };
  return (
    <NavLink to={href} className={linkClass} style={textStyle}>
      {text}
      {isMain && <img src="/favicon.ico" alt="Logo" style={{ marginRight: '10px' }} />}
    </NavLink>
  );
};

export default function NavBar() {

  const [user, setUser] = useState({}); 
  const google = window.google

  function handleCallbackResponse(response) {
    console.log("Encoded JWT ID token: " + response.credential);
    var userObject = jwtDecode(response.credential);
    console.log(userObject);
    setUser(userObject);
    document.getElementById("signInDiv").hidden = true;
  }

  function handleSignOut(event) {
    setUser({});
    document.getElementById("signInDiv").hidden = false;
  }

  useEffect(() => {
    google.accounts.id.initialize({
      client_id: "836975966861-dpsnj5ub1i7o5amlmvtmuc98a5c6ia26.apps.googleusercontent.com",
      callback: handleCallbackResponse
    })
    google.accounts.id.renderButton(
      document.getElementById("signInDiv"),
      { theme: "outline", size: "large"}
    )
  }, [])

  return (
    <AppBar position='static'>
      <Container maxWidth='xl'>
        <Toolbar disableGutters>
          <NavText href='/' text='MedicalDB' isMain />
          <NavText href='/summary' text='Summary' />
          <NavText href='/patient-search-results' text='Patient Search' />
          <NavText href='/encounter-search' text='Encounter Search' />
          <NavText href='/claims-fraud' text='Claims & Fraud' />
          <NavText href='/miscellaneous' text='Miscellaneous' />
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}> {/* Aligns the sign-in div to the right */}
            <div id='signInDiv'></div>
            {Object.keys(user).length !== 0 &&
              <>
                <span style={{ marginRight: '10px' }}>Welcome, {user.name}</span>
                <button onClick={(e) => handleSignOut(e)}>Sign Out</button>
              </>
            }
          </div>
        </Toolbar>
      </Container>
    </AppBar>
  );
  
  
}

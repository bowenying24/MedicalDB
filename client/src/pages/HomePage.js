import React from 'react';

const HomePage = () => {
    // Inline styling for the various components
    const styles = {
        container: {
            height: '100vh', // Full height of the viewport
            display: 'flex',
            flexDirection: 'column', // Stack children vertically
            justifyContent: 'center', // Center content vertically
            alignItems: 'center', // Center content horizontally
            backgroundImage: 'url(https://media.istockphoto.com/id/1327568875/photo/healthcare-business-graph-data-and-growth-insurance-healthcare-doctor-analyzing-medical-of.jpg?s=612x612&w=0&k=20&c=R4idIeTPq0f1TPSJwAq4KUeLUQg6ul8eIBSjvs9MXQk=)',
            backgroundSize: 'cover', // Cover the entire area of the container
            backgroundPosition: 'center', // Center the background image
            fontFamily: 'Helvetica', // Set Helvetica font
        },
        textWrapper: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)', // Translucent gray
            padding: '20px', // Padding around the text
            borderRadius: '10px', // Rounded corners
            textAlign: 'center', // Center the text inside the wrapper
        },
        title: {
            fontSize: '60px', // Font size for title
            color: 'white', // White text color
            marginBottom: '20px', // Space between title and subtitle
            fontWeight: 'bold', // Make the title bold
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)', // Shadow for the title
        },
        subtitle: {
            fontSize: '30px', // Font size for subtitle
            color: 'white', // White text color
            marginBottom: '20px', // Space between subtitle and sub-subtitle
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)', // Shadow for the subtitle
        },
        subSubtitle: {
            fontSize: '20px', // Font size for sub-subtitle
            color: 'white', // White text color
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)', // Shadow for the sub-subtitle
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.textWrapper}>
                <div style={styles.title}>
                    Welcome to MedicalDB+
                </div>
                <div style={styles.subtitle}>
                    A healthcare fraud detection database system
                </div>
                <div style={styles.subSubtitle}>
                    by Team 32 - Chris, Lance, Eric, Bowen
                </div>
            </div>
        </div>
    );
};

export default HomePage;

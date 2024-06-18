import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CssBaseline, ThemeProvider } from '@mui/material'
import { indigo, amber } from '@mui/material/colors'
import { createTheme } from "@mui/material/styles";

import NavBar from './components/NavBar';
import HomePage from './pages/HomePage';
import PatientSearch from './pages/PatientSearch';
import EncounterSearchPage from './pages/EncounterSearchPage';
import ClaimsFraudPage from './pages/ClaimsFraudPage'
import MiscPage from './pages/MiscPage'
import SummaryPage from './pages/SummaryPage'

// createTheme enables you to customize the look and feel of your app past the default
// in this case, we only change the color scheme
export const theme = createTheme({
  palette: {
    primary: indigo,
    secondary: amber,
  },
});

// App is the root component of our application and as children contain all our pages
// We use React Router's BrowserRouter and Routes components to define the pages for
// our application, with each Route component representing a page and the common
// NavBar component allowing us to navigate between pages (with hyperlinks)
export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <NavBar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/summary" element={<SummaryPage />} />
          <Route path="/patient-search-results" element={<PatientSearch />} />
          <Route path="/claims-fraud" element={<ClaimsFraudPage />} />
          <Route path="/encounter-search" element={<EncounterSearchPage />} />
          <Route path="/miscellaneous" element={<MiscPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
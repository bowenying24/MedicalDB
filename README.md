# CIS-5500-Fall-2023-Final-Project-Team-32
This repository includes files associated with the CIS5500 Final Project, involving the design of a database for medical claims.

# Directory
MySQL: This directory includes the SQL DDL statements for creating the database schema and a text file of SQL queries for database analytics. It also includes a text file of the queries used by the web application. <br />
server: This folder includes the server-side files for the Node.js environment <br />
  - index.js: server application file <br />
  - routes.js: File containing routes to respond to client requests <br />
  - config.json: includes the database connection parameters <br />
client: This folder includes the client-side files for running the React.js user interface <br />
Data_Preprocessing.ipynd: Python Jupyter notebook file used for preprocessing, normalization, and exporting database tables <br />
Database_Connection_Info.txt: Text file that includes the database connection info

# Creating the Database Locally
Download the necessary datasets: The Healthcare Fraud Detection Analysis Dataset from Kaggle at https://www.kaggle.com/datasets/rohitrox/healthcare-provider-fraud-detection-analysis. The ICD-9 Diagnosis and Procedure Code dictionary files are available from the Centers for Medicare & Medicaid Services: https://www.cms.gov/medicare/coding-billing/icd-10-codes/icd-9-cm-diagnosis-procedure-codes-abbreviated-and-full-code-titles.

Preprocess the data:  The python Jupyter notebook file Data_Preprocessing.ipynb in the root directory is used for cleaning and reconfiguring the data through a normalization process. Individual CSV files are exported for loading into the Medical Claims Database.

Initialize the database: The MySQL folder includes the file medicalclaims_db_set.sql for running the DDL statements for creating the schema. After running this file, the csv tables can be loaded into the appropriate table.

# Running the application
Navigate to the root directory: Run the command "npm run build" <br />
From the client folder run: "npm start" <br />
From the server folder run: "npm start"

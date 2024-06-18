/** Create Database **/
CREATE DATABASE medicalclaims_db ;

SHOW DATABASES ;

USE medicalclaims_db ;

/** SQL DDL **/
CREATE TABLE Patient
(BeneID VARCHAR(10) PRIMARY KEY,
DOB DATE,
DOD DATE,
Gender VARCHAR(10),
Race VARCHAR(30),
State VARCHAR(30),
County VARCHAR(40)
) ;

CREATE TABLE Provider
(ProviderID VARCHAR(10) PRIMARY KEY,
PotentialFraud VARCHAR(8)
) ;

CREATE TABLE Encounter
(ClaimID VARCHAR(10) PRIMARY KEY,
BeneID VARCHAR(10),
Type VARCHAR(10) NOT NULL CHECK (Type IN ('Inpatient','Outpatient')),
ClaimStartDate DATE,
ClaimEndDate DATE,
ProviderID VARCHAR(10),
AmountReimbursed DECIMAL(19,2),
Deductible DECIMAL(19,2),
FOREIGN KEY (BeneID) REFERENCES Patient (BeneID),
FOREIGN KEY (ProviderID) REFERENCES Provider (ProviderID)
) ;

CREATE INDEX Encounter_ProviderID
    ON Encounter (ProviderID);

CREATE INDEX Encounter_Date
    ON Encounter (ClaimStartDate);

CREATE TABLE Inpatient
(ClaimID VARCHAR(10) PRIMARY KEY,
Type VARCHAR(10) NOT NULL CHECK (Type='Inpatient'),
AdmissionDate DATE,
DischargeDate DATE,
FOREIGN KEY (ClaimID) REFERENCES Encounter (ClaimID)
) ;

CREATE TABLE Outpatient
(ClaimID VARCHAR(10) PRIMARY KEY,
Type VARCHAR(10) NOT NULL CHECK (Type = 'Outpatient'),
FOREIGN KEY (ClaimID) REFERENCES Encounter (ClaimID)
) ;

CREATE TABLE Comorbidity
(BeneID VARCHAR(10),
Comorbidity VARCHAR(50),
CONSTRAINT PK_Comorbidity PRIMARY KEY (BeneID, Comorbidity),
FOREIGN KEY (BeneID) REFERENCES Patient (BeneID)
) ;

CREATE TABLE DiagnosisReference
(DxCode VARCHAR(8) PRIMARY KEY,
DxName VARCHAR(80)
) ;

CREATE TABLE EncounterDiagnosis
(ClaimID VARCHAR(10),
DxNum INTEGER,
DxCode VARCHAR(8),
CONSTRAINT PK_EncounterDiagnosis PRIMARY KEY (ClaimID, DxNum),
FOREIGN KEY (ClaimID) REFERENCES Encounter (ClaimID)
#FOREIGN KEY (DxCode) REFERENCES DiagnosisReference (DxCode)
) ;

CREATE TABLE ProcedureReference
(ProcedureCode INTEGER PRIMARY KEY,
ProcedureName VARCHAR(80)
) ;

CREATE TABLE EncounterProcedure
(ClaimID VARCHAR(10),
ProcedureNum INTEGER,
ProcedureCode INTEGER,
CONSTRAINT PK_EncounterProcedure PRIMARY KEY (ClaimID, ProcedureNum),
FOREIGN KEY (ClaimID) REFERENCES Encounter (ClaimID)
#FOREIGN KEY (ProcedureCode) REFERENCES ProcedureReference (ProcedureCode)
) ;

SHOW TABLES ;

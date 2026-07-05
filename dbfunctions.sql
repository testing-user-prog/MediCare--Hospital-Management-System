DROP PROCEDURE IF EXISTS deletesession;
GO
CREATE PROCEDURE deletesession
@sessid Int
as 
begin
    UPDATE Session SET Status = 'Cancelled' WHERE SessionID = @sessid
end
GO

DROP PROCEDURE IF EXISTS sessiondetails;
GO
CREATE PROCEDURE sessiondetails
@cnic varchar(20)
as
begin
    SELECT SessionID, d.Name as DoctorName, SessionDate, StartTime, EndTime, RoomID, SessionType, SessionCharges 
    FROM Session s
    join Patient p on p.PatientID = s.PatientID 
    join Doctor d on d.DoctorID = s.DoctorID
    where Status = 'Booked' and p.cnic = @cnic
end
GO

DROP PROCEDURE IF EXISTS getPatient;
GO
CREATE PROCEDURE getPatient
@cnic varchar(20)
as 
begin
    Select * from Patient where Patient.CNIC = @cnic
end
GO

DROP PROCEDURE IF EXISTS addpatient;
GO
CREATE PROCEDURE addpatient
    @cnic       VARCHAR(20),
    @name       VARCHAR(100),
    @age        INT,
    @gender     CHAR(1),
    @bloodGroup VARCHAR(3),
    @phone      VARCHAR(20)
AS
BEGIN
    INSERT INTO Patient (CNIC, Name, Age, Gender, BloodGroup, Phone)
    VALUES (@cnic, @name, @age, @gender, @bloodGroup, @phone)
END
GO

DROP PROCEDURE IF EXISTS getDoctor;
GO
CREATE PROCEDURE getDoctor
AS
BEGIN
    SELECT distinct d.*, t.DayOfWeek, t.StartTime, t.EndTime
    FROM Doctor d
    JOIN DoctorAvailableTime t ON d.DoctorID = t.DoctorID
    Join DoctorCharges c on d.DoctorID=c.DoctorID
    where t.DayOfWeek is not null and t.StartTime is not null and t.EndTime is not null and Charges is not null
    ORDER BY d.DoctorID
END
GO

DROP PROCEDURE IF EXISTS getBookedSessions;
GO
CREATE PROCEDURE getBookedSessions
    @docid INT
AS
BEGIN
    SELECT SessionDate, StartTime, EndTime
    FROM Session
    WHERE DoctorID = @docid AND Status = 'Booked'
END
GO

DROP PROCEDURE IF EXISTS getDoctorTime;
GO
CREATE PROCEDURE getDoctorTime
    @docid INT,
    @appointmentday VARCHAR(10)
AS
BEGIN
    SELECT StartTime, EndTime 
    FROM DoctorAvailableTime 
    WHERE DoctorID = @docid AND DayOfWeek = @appointmentday
END
GO

DROP PROCEDURE IF EXISTS checkTimeConflict;
GO
CREATE PROCEDURE checkTimeConflict
    @docid INT,
    @sessdate DATE,
    @sttime TIME,
    @end_time TIME
AS
BEGIN
    SELECT * FROM Session
    WHERE DoctorID = @docid
    AND Status = 'Booked'
    AND SessionDate = @sessdate
    AND (
        @sttime BETWEEN StartTime AND EndTime
        OR @end_time BETWEEN StartTime AND EndTime
        OR StartTime BETWEEN @sttime AND @end_time
    )
END
GO

DROP PROCEDURE IF EXISTS getPatientID;
GO
CREATE PROCEDURE getPatientID
    @cnic VARCHAR(20)
AS
BEGIN
    SELECT PatientID FROM Patient WHERE CNIC = @cnic
END
GO

DROP PROCEDURE IF EXISTS getPastAppointments;
GO
CREATE PROCEDURE getPastAppointments
    @patid INT,
    @docid INT,
    @type VARCHAR(20)
AS
BEGIN
    SELECT COUNT(*) AS apptcount
    FROM Session
    WHERE DoctorID = @docid
    AND SessionType = @type
    AND Status = 'Completed'
    AND PatientID = @patid
END
GO

DROP PROCEDURE IF EXISTS getAvailableRoom;
GO
CREATE PROCEDURE getAvailableRoom
    @type VARCHAR(20),
    @sessdate DATE,
    @sttime TIME,
    @endtime TIME
AS
BEGIN
    SELECT r.RoomID FROM Room r
    WHERE r.Type = @type
    AND r.RoomID NOT IN (
        SELECT s.RoomID FROM Session s
        WHERE s.Status = 'Booked'
        AND s.SessionDate = @sessdate
        AND (
            @sttime BETWEEN s.StartTime AND s.EndTime
            OR @endtime BETWEEN s.StartTime AND s.EndTime
            OR s.StartTime BETWEEN @sttime AND @endtime
        )
    )
END
GO

DROP PROCEDURE IF EXISTS getDoctorCharges;
GO
CREATE PROCEDURE getDoctorCharges
    @docid INT,
    @type VARCHAR(20)
AS
BEGIN
    SELECT Charges FROM DoctorCharges
    WHERE DoctorID = @docid AND SessionType = @type
END
GO

DROP PROCEDURE IF EXISTS insertSession;
GO
CREATE PROCEDURE insertSession
    @patid INT,
    @docid INT,
    @type VARCHAR(20),
    @sessdate DATE,
    @sttime TIME,
    @end_time TIME,
    @sesscharges DECIMAL(10,2),
    @status VARCHAR(20),
    @roomid INT
AS
BEGIN
    INSERT INTO Session (PatientID, DoctorID, SessionType, SessionDate, StartTime, EndTime, SessionCharges, Status, RoomID)
    VALUES (@patid, @docid, @type, @sessdate, @sttime, @end_time, @sesscharges, @status, @roomid)
END
GO

DROP PROCEDURE IF EXISTS getLatestSession;
GO
CREATE PROCEDURE getLatestSession
AS
BEGIN
    SELECT p.CNIC, p.Name AS PatientName, d.DoctorID, d.Name AS DoctorName,
           a.SessionType, a.SessionDate, a.StartTime, a.EndTime, a.SessionCharges
    FROM (
        SELECT TOP 1 PatientID, DoctorID, SessionType, SessionDate, StartTime, EndTime, SessionCharges
        FROM Session
        ORDER BY SessionID DESC
    ) AS a
    JOIN Doctor d ON a.DoctorID = d.DoctorID
    JOIN Patient p ON p.PatientID = a.PatientID
END
GO

DROP PROCEDURE IF EXISTS unpaid_Patientsession;
GO
CREATE PROCEDURE unpaid_Patientsession
@patientId int
as
begin
    Select p1.SessionID, PatientID, DoctorID, RoomID, SessionType, SessionDate, StartTime, EndTime, SessionCharges 
    from Session p1
    join Billing b1 on b1.SessionID = p1.SessionID and b1.PaymentStatus = 'Pending'
    where PatientID = @patientId and status = 'Completed'
end
GO

DROP PROCEDURE IF EXISTS generate_bill;
Go
CREATE PROCEDURE generate_bill
@session_id INT,
@total DECIMAL(10,2) OUTPUT
AS
BEGIN
    SELECT @total = SessionCharges 
    FROM Session
    WHERE SessionID = @session_id;



    DECLARE @medicinecharges DECIMAL(10,2)
    SELECT @medicinecharges =isnull(MedicineCharges,0) 
    FROM Billing
    where SessionID=@session_id

    SELECT @total = @total + @medicinecharges


    UPDATE Billing
    SET MedicineCharges = @medicinecharges,
        TotalAmount = @total,
        PaymentStatus = 'Paid'
    WHERE SessionID = @session_id
END
GO

DROP VIEW IF EXISTS viewdoctors;
GO
CREATE VIEW viewdoctors
as
Select * from Doctor
GO

DROP VIEW IF EXISTS viewdepartments;
GO
CREATE VIEW viewdepartments
as
Select * from Department
GO

DROP PROCEDURE IF EXISTS gettotaldocearnings;
GO
CREATE PROCEDURE gettotaldocearnings
@d_id int,
@startdate date,
@enddate date,
@total int output
as begin
    Select @total = ISNULL(sum(TotalAmount-MedicineCharges), 0)
    from Billing
    where SessionID in(
        Select SessionID from Session
        where DoctorID=@d_id and Status='Completed'
        and SessionDate>=@startdate and SessionDate<=@enddate) and PaymentStatus='Paid'
end
GO

DROP PROCEDURE IF EXISTS departmenttotal;
GO
CREATE PROCEDURE departmenttotal
    @dept_id   INT,
    @startdate DATE,
    @enddate   DATE,
    @total     INT OUTPUT
AS
BEGIN
    SET @total = 0
    DECLARE @doctortotal INT
    DECLARE @doctorid    INT
    DECLARE @i           INT = 1
    DECLARE @count       INT

    CREATE TABLE #doctors (RowNum INT IDENTITY(1,1), DoctorID INT)

    INSERT INTO #doctors (DoctorID)
        SELECT DISTINCT s1.DoctorID
        FROM Session s1
        JOIN Room r1       ON s1.RoomID       = r1.RoomID
        JOIN Department d1 ON r1.DepartmentID = d1.DepartmentID
        WHERE d1.DepartmentID = @dept_id

    SELECT @count = COUNT(*) FROM #doctors

    WHILE @i <= @count
    BEGIN
        SELECT @doctorid = DoctorID
        FROM #doctors
        WHERE RowNum = @i

        SET @doctortotal = 0

        EXEC gettotaldocearnings
            @d_id      = @doctorid,
            @startdate = @startdate,
            @enddate   = @enddate,
            @total     = @doctortotal OUTPUT

        SET @total = @total + @doctortotal
        SET @i = @i + 1
    END
    DROP TABLE #doctors
END
GO

DROP VIEW IF EXISTS vw_DoctorList;
DROP VIEW IF EXISTS display_freeDoc;
DROP VIEW IF EXISTS dual_doctor;
DROP PROCEDURE IF EXISTS addDoctor;
DROP PROCEDURE IF EXISTS viewDoctorDetails;
DROP PROCEDURE IF EXISTS viewDoctorAvailability;
DROP PROCEDURE IF EXISTS viewDoctorCharges;
DROP PROCEDURE IF EXISTS getDoctorTotalEarnings;
DROP PROCEDURE IF EXISTS editDoctorInfo;
DROP PROCEDURE IF EXISTS editDoctorAvailability;
DROP PROCEDURE IF EXISTS editDoctorCharges;
DROP PROCEDURE IF EXISTS deleteDoctor;

DROP TRIGGER IF EXISTS trg_AddDoctorDefaults;
DROP TRIGGER IF EXISTS trg_PreventUpdateDoctor;
DROP TRIGGER IF EXISTS trg_PreventUpdateDoctorCharges;
DROP TRIGGER IF EXISTS trg_PreventUpdateDoctorAvailability;
GO


---- display the ids and names of doctors  
CREATE VIEW vw_DoctorList AS
SELECT DoctorID, Name
FROM Doctor
GO


---- add the doctor
CREATE PROCEDURE addDoctor
    @name           VARCHAR(100),
    @age            INT,
    @gender         CHAR(1),
    @specialization VARCHAR(100)
AS
BEGIN

    IF lower(@gender) NOT IN ('m', 'f')
    BEGIN
        RAISERROR('Gender must be M or F.', 16, 1)
        RETURN
    END

    IF @age <= 0 OR @age > 100
    BEGIN
        RAISERROR('Please enter a valid age.', 16, 1)
        RETURN
    END

    INSERT INTO Doctor (Name, Age, Gender, Specialization)
    VALUES (@name, @age, @gender, @specialization)
END
GO

---- a trigger that marks the entry of the doctor id in the charges and availabilty table
CREATE TRIGGER trg_AddDoctorDefaults
ON Doctor
AFTER INSERT
AS
BEGIN
    INSERT INTO DoctorAvailableTime (DoctorID)
    SELECT
        inserted.DoctorID
    FROM inserted

    INSERT INTO DoctorCharges (DoctorID)
    SELECT
        inserted.DoctorID
    FROM inserted
END
GO

---- view doctor attributes
CREATE PROCEDURE viewDoctorDetails
    @docid INT
AS
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Doctor WHERE DoctorID = @docid)
    BEGIN
        RAISERROR('Doctor not found.', 16, 1)
        RETURN
    END

    SELECT
        DoctorID,
        Name,
        Age,
        Gender,
        Specialization
    FROM Doctor
    WHERE DoctorID = @docid
END
GO 

--- view doctor availabilty details
CREATE PROCEDURE viewDoctorAvailability
    @docid INT
AS
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Doctor WHERE DoctorID = @docid)
    BEGIN
        RAISERROR('Doctor not found.', 16, 1)
        RETURN
    END
    SELECT 
    TimeID,
        DayOfWeek,    
        CONVERT(VARCHAR(8), StartTime, 108) AS StartTime,
        CONVERT(VARCHAR(8), EndTime, 108) AS EndTime
    FROM DoctorAvailableTime 
    WHERE DoctorID=@docid
END
GO

-- view doctor charges details
CREATE PROCEDURE viewDoctorCharges
    @docid INT
AS
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Doctor WHERE DoctorID = @docid)
    BEGIN
        RAISERROR('Doctor not found.', 16, 1)
        RETURN
    END

    SELECT ChargeID,SessionType,Charges 
    FROM DoctorCharges 
    WHERE DoctorID=@docid
END
GO


-- display doctors with no bookings 
CREATE VIEW display_freeDoc AS
SELECT d.DoctorID, d.Name AS DoctorName
FROM Doctor d
WHERE NOT EXISTS (
    SELECT 1 
    FROM Session s 
    WHERE s.DoctorID = d.DoctorID 
    AND LOWER(s.Status) = 'booked'
);
GO

-- display doctor who worked as consultant and operation
CREATE VIEW dual_doctor AS 
SELECT
    d.DoctorID,
    d.Name,
    s.SessionID,
    s.SessionType,
    s.SessionDate,
    CONVERT(VARCHAR(8), s.StartTime, 108) AS StartTime,
    CONVERT(VARCHAR(8), s.EndTime, 108) AS EndTime
FROM Doctor d
JOIN Session s
ON d.DoctorID=s.DoctorID
WHERE d.DoctorID
IN
(
    SELECT DoctorID
    FROM Session
    WHERE lower(SessionType) = 'consultation'
    INTERSECT
    SELECT DoctorID
    FROM Session
    WHERE lower(SessionType) = 'operation'
)
GO 


-- view doctor work details
CREATE PROCEDURE getDoctorTotalEarnings
    @docid INT
AS
BEGIN
    SET NOCOUNT ON

    IF NOT EXISTS (SELECT 1 FROM Doctor WHERE DoctorID = @docid)
    BEGIN
        RAISERROR('Doctor not found.', 16, 1)
        RETURN
    END

    SELECT
        d.DoctorID,
        d.Name AS DoctorName,
        d.Specialization,
        COUNT(s.SessionID)  TotalCompletedSessions,
        SUM(CASE WHEN s.SessionType = 'Consultation' THEN 1 ELSE 0 END)  AS TotalConsultations,
        SUM(CASE WHEN s.SessionType = 'Operation'    THEN 1 ELSE 0 END)  AS TotalOperations,
        SUM(CASE WHEN s.SessionType = 'Consultation' THEN s.SessionCharges ELSE 0 END) AS ConsultationEarnings,
        SUM(CASE WHEN s.SessionType = 'Operation'    THEN s.SessionCharges ELSE 0 END) AS OperationEarnings,
        SUM(s.SessionCharges) AS TotalEarnings
    FROM Doctor  d
    JOIN Session s ON d.DoctorID = s.DoctorID
    WHERE d.DoctorID = @docid
      AND s.Status   = 'Completed'
    GROUP BY   d.DoctorID, d.Name, d.Specialization
END
GO


-- edit doctor info 
CREATE PROCEDURE editDoctorInfo
    @docid INT,
    @name VARCHAR(100) = NULL,
    @age INT  = NULL,
    @gender CHAR(1)= NULL,
    @specialization VARCHAR(100) = NULL
AS
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Doctor WHERE DoctorID = @docid)
    BEGIN
        RAISERROR('Doctor not found.', 16, 1)
        RETURN
    END
    IF @gender IS NOT NULL AND @gender NOT IN ('M', 'F')
    BEGIN
        RAISERROR('Gender must be M or F.', 16, 1)
        RETURN
    END
    IF @age IS NOT NULL AND (@age <= 0 OR @age > 100)
    BEGIN
        RAISERROR('Please enter a valid age.', 16, 1)
        RETURN
    END
    UPDATE Doctor
    SET
        Name = ISNULL(@name, Name),
        Age  = ISNULL(@age,Age),
        Gender  = ISNULL(@gender,Gender),
        Specialization = ISNULL(@specialization, Specialization)
    WHERE DoctorID = @docid

END
GO

-- edit doctor availability info 
CREATE PROCEDURE editDoctorAvailability
    @timeID  INT ,
    @dayOfWeek VARCHAR(10) = NULL,
    @startTime TIME = NULL,
    @endTime   TIME = NULL
AS
BEGIN
    IF NOT EXISTS (SELECT 1 FROM DoctorAvailableTime WHERE TimeID = @timeID )
    BEGIN
        RAISERROR('Availability slot not found .', 16, 1)
        RETURN
    END

    -- Validate day if provided
    IF @dayOfWeek IS NOT NULL AND lower(@dayOfWeek) NOT IN
       ('monday','tuesday','wednesday','thursday','friday','saturday','sunday')
    BEGIN
        RAISERROR('Invalid day. Use full name e.g. Monday, Tuesday...', 16, 1)
        RETURN
    END

    -- Get existing times to validate range when only one is updated
    DECLARE @existingStart TIME
    DECLARE @existingEnd TIME

    SELECT  @existingStart = StartTime, @existingEnd = EndTime
    FROM  DoctorAvailableTime WHERE TimeID = @timeID

    DECLARE @finalStart TIME = ISNULL(@startTime,@existingStart)
    DECLARE @finalEnd TIME = ISNULL(@endTime,@existingEnd)

    IF @finalStart >= @finalEnd
    BEGIN
        RAISERROR('Start time must be before end time.', 16, 1)
        RETURN
    END

    UPDATE DoctorAvailableTime 
    SET
        DayOfWeek= ISNULL(@dayOfWeek, DayOfWeek),
        StartTime = @finalStart,
        EndTime = @finalEnd
    WHERE TimeID = @timeID

END
GO

-- edit doctor charges info 
CREATE PROCEDURE editDoctorCharges
    @chargeID INT,
    @sessionType VARCHAR(20) = NULL, -- Default to NULL for optional updates
    @newCharges DECIMAL(10,2) = NULL -- Default to NULL for optional updates
AS
BEGIN
    -- 1. Check if the record exists
    IF NOT EXISTS (SELECT 1 FROM DoctorCharges WHERE ChargeID = @chargeID)
    BEGIN
        RAISERROR('Doctor Charges not found.', 16, 1)
        RETURN
    END

    -- 2. Validation: Only validate if a NEW value is actually being passed
    IF @sessionType IS NOT NULL AND LOWER(@sessionType) NOT IN ('consultation', 'operation')
    BEGIN
        RAISERROR('Session type must be Consultation or Operation.', 16, 1)
        RETURN
    END

    IF @newCharges IS NOT NULL AND @newCharges <= 0
    BEGIN
        RAISERROR('Charges cannot be less than or equal to 0.', 16, 1)
        RETURN
    END

    UPDATE DoctorCharges
    SET 
        SessionType = ISNULL(@sessionType, SessionType),
        Charges = ISNULL(@newCharges,  Charges)
    WHERE ChargeID = @chargeID
END
GO




CREATE TRIGGER trg_PreventUpdateDoctor
ON Doctor
INSTEAD OF UPDATE
AS
BEGIN

    IF EXISTS (
        SELECT 1 FROM Session s
        JOIN inserted i ON s.DoctorID = i.DoctorID
        WHERE s.Status = 'Booked'
    )

    BEGIN
        RAISERROR('Cannot update doctor info. This doctor has active booked sessions.', 16, 1)
        ROLLBACK TRANSACTION
        RETURN
    END

    -- No booked sessions, allow update
    UPDATE Doctor SET
        Name  = i.Name,
        Age    = i.Age,
        Gender  = i.Gender,
        Specialization = i.Specialization
    FROM Doctor d
    JOIN inserted i ON d.DoctorID = i.DoctorID
END
GO


CREATE TRIGGER trg_PreventUpdateDoctorCharges
ON DoctorCharges
INSTEAD OF UPDATE
AS
BEGIN
    SET NOCOUNT ON

    IF EXISTS (
        SELECT 1 FROM Session s
        JOIN inserted i ON s.DoctorID = i.DoctorID
        WHERE s.Status = 'Booked'
    )
    BEGIN
        RAISERROR('Cannot update doctor charges. This doctor has active booked sessions.', 16, 1)
        ROLLBACK TRANSACTION
        RETURN
    END

    -- No booked sessions, allow update
    UPDATE DoctorCharges SET
        SessionType = i.SessionType,
        Charges = i.Charges
    FROM DoctorCharges dc
    JOIN inserted i ON dc.ChargeID = i.ChargeID
END
GO


CREATE TRIGGER trg_PreventUpdateDoctorAvailability
ON DoctorAvailableTime
INSTEAD OF UPDATE
AS
BEGIN
    SET NOCOUNT ON

    IF EXISTS (
        SELECT 1 FROM Session s
        JOIN inserted i ON s.DoctorID = i.DoctorID
        WHERE s.Status = 'Booked'
    )
    BEGIN
        RAISERROR('Cannot update doctor availability. This doctor has active booked sessions.', 16, 1)
        ROLLBACK TRANSACTION
        RETURN
    END

    -- No booked sessions, allow update
    UPDATE DoctorAvailableTime
    SET
        DayOfWeek = i.DayOfWeek,
        StartTime = i.StartTime,
        EndTime = i.EndTime
    FROM DoctorAvailableTime dat
    JOIN inserted i ON dat.TimeID = i.TimeID
END
GO

-- 

-- deleting doctor 
CREATE PROCEDURE deleteDoctor
    @docid INT
AS
BEGIN
    SET NOCOUNT ON

    IF NOT EXISTS (SELECT 1 FROM Doctor WHERE DoctorID = @docid)
    BEGIN
        RAISERROR('Doctor not found.', 16, 1)
        RETURN
    END

    IF EXISTS (SELECT 1 FROM Session WHERE DoctorID = @docid AND lower(Status) = 'booked')
    BEGIN
        RAISERROR('Cannot delete doctor. This doctor has active booked sessions.', 16, 1)
        RETURN
    END

    DELETE FROM Doctor
    WHERE DoctorID = @docid

END
GO



--------------------- PHARMACY SECTION -----------------

DROP VIEW IF EXISTS PharmacyInventory;
GO
-- Display Medicines
CREATE VIEW PharmacyInventory AS
SELECT m.MedicineID,m.Name,m.Type,m.Price,m.MinimumStockLevel,ps.CurrentQuantity,ps.LastUpdated
FROM Medicines m
JOIN PharmacyStock ps 
ON m.MedicineID = ps.MedicineID
GO

DROP PROCEDURE IF EXISTS insert_medicine;
GO
-- adding medicine
CREATE PROCEDURE insert_medicine
    @Name varchar(100),
    @Type varchar(50),
    @Price decimal(10,2),
    @MinStock int
AS
BEGIN
    IF @Price <= 0 OR @MinStock <= 0
    BEGIN
        RAISERROR('Price and Minimum Stock must be greater than zero.', 16, 1);
        RETURN;
    END
    IF EXISTS (SELECT 1 FROM Medicines WHERE LOWER(Name) = LOWER(@Name))
    BEGIN
        RAISERROR('Medicine with this name already exists in the system.', 16, 1);
        RETURN;
    END

    INSERT INTO Medicines (Name, Type, Price, MinimumStockLevel)
    VALUES (@Name, @Type, @Price, @MinStock);
END
GO

DROP TRIGGER IF EXISTS add_inPharmacy;
GO
-- add into pharmacy stock through trigger 
CREATE TRIGGER add_inPharmacy ON Medicines
AFTER INSERT 
AS 
BEGIN
    INSERT INTO PharmacyStock (MedicineID, CurrentQuantity)
    SELECT inserted.MedicineID, 0 -- setting currentQuantity to 0 
    FROM inserted
END 
GO

DROP PROCEDURE IF EXISTS add_stock;
GO
-- add medicine stock
CREATE PROCEDURE add_stock 
@MedicineID INT,
@addQuantity INT
AS 
BEGIN
    if @MedicineID not in (SELECT @MedicineID FROM PharmacyStock)
    BEGIN
        RAISERROR('Medicine ID not registered.', 16, 1);
        RETURN;
    END

    IF @addQuantity<=0 
    BEGIN
        RAISERROR('Quantity must be a positive number.', 16, 1);
        RETURN;
    END

    UPDATE PharmacyStock
    SET CurrentQuantity= CurrentQuantity + @addQuantity,
        LastUpdated = GETDATE()
    WHERE MedicineID= @MedicineID
END
GO

DROP VIEW IF EXISTS top_5_med_use;
GO
-- top 5 medicine being used 
CREATE VIEW top_5_med_use AS
SELECT TOP 5 m.MedicineID,m.Name, SUM(p.Quantity) as total_usage
FROM Medicines m
JOIN Prescription p 
ON p.MedicineID=m.MedicineID
GROUP BY m.MedicineID,m.Name
ORDER BY total_usage DESC
GO

DROP VIEW IF EXISTS top_5_med_profits;
GO
-- top 5 medicines which made the most money from sales (excluding cost to purchase)
CREATE VIEW top_5_med_profits AS
SELECT TOP 5 m.MedicineID,m.Name, SUM (m.Price * p.Quantity) as SalesAmount
FROM Medicines m
JOIN Prescription p 
ON p.MedicineID=m.MedicineID
GROUP BY m.MedicineID,m.Name
ORDER BY SalesAmount DESC
GO



-----------------------------------------------------------
-- Managing sessions

DROP PROCEDURE IF EXISTS prompt_session;
DROP PROCEDURE IF EXISTS handle_prescription_decision;
DROP PROCEDURE IF EXISTS add_prescription;
DROP PROCEDURE IF EXISTS add_sessionsymptom;
DROP PROCEDURE IF EXISTS add_sessiondiagnosis;
DROP VIEW IF EXISTS display_booked_session;
DROP VIEW IF EXISTS display_completed_session;
DROP VIEW IF EXISTS display_cancelled_session;
DROP VIEW IF EXISTS display_docLess_session;
DROP VIEW IF EXISTS sym_less_session;
DROP VIEW IF EXISTS diag_less_session;
GO


-- if there are session that got completed then return list of them 
CREATE PROCEDURE prompt_session
AS 
BEGIN
    SET NOCOUNT ON;

    UPDATE Session
    SET Status = 'Completed'
    WHERE  CAST(GETDATE() AS TIME) > EndTime
            AND SessionDate = CAST(GETDATE() AS DATE)
            AND lower(Status) = 'booked' 
    

    -- as billing wont have the session details 
    SELECT s.SessionID
    FROM Session s
    LEFT JOIN Billing b ON s.SessionID = b.SessionID
    WHERE LOWER(s.Status) = 'completed'
           AND b.BillID IS NULL
END 
GO

-- if we get non empty result from prompt_session procedure then ask for entering medicine
CREATE PROCEDURE handle_prescription_decision
    @SessionID INT,
    @Decision CHAR(3)
AS
BEGIN
    SET NOCOUNT ON;
    
    IF LOWER(@Decision) = 'yes'
    BEGIN
        SELECT 'OPEN_FORM' AS Action,@SessionID AS SessionID;
    END

    ELSE
    BEGIN
        INSERT INTO Billing (SessionID, MedicineCharges, PaymentStatus)
        VALUES (@SessionID, 0.00, 'Pending');  
    END
END
GO



-- ask how many medicines in frontend and loop for this procedure input in prescription table if within stock
CREATE PROCEDURE add_prescription 
@sessionID int, 
@MedicineID INT,
@Quantity INT ,
@Dosage varchar(100),
@duration varchar (50)
AS
BEGIN
    SET NOCOUNT ON;

    IF @Quantity<=(SELECT ps.CurrentQuantity FROM PharmacyStock ps WHERE ps.MedicineID = @MedicineID)
    BEGIN 
        UPDATE PharmacyStock
        SET CurrentQuantity = CurrentQuantity - @Quantity
        WHERE @MedicineID= MedicineID

        INSERT INTO Prescription VALUES 
        (@sessionID,@MedicineID,@Quantity,@Dosage,@duration)
        
        DECLARE @price DECIMAL(10,2)
        
        SELECT @price = m.Price
        FROM Medicines m
        WHERE @MedicineID = m.MedicineID

        IF @sessionID NOT in (SELECT SessionID FROM Billing) 
        BEGIN 
            INSERT INTO BILLING  (sessionID,MedicineCharges) VALUES 
            (@sessionID,@price * @Quantity)   
        END

        ELSE
        BEGIN
            UPDATE Billing 
            SET MedicineCharges = MedicineCharges + (@price*@Quantity) 
            WHERE @sessionID=SessionID
                        
        END
    END
    ELSE
    BEGIN
         RAISERROR('Not Allocated ! Medicine Stock Not Enough.', 16, 1)
        RETURN
    END
END 
GO
-- a procedure that take session id and symptom name and perform checks and insert accordingly
CREATE PROCEDURE add_sessionsymptom
@sessionid INT ,
@SymptomName varchar(100) = NULL
AS 
BEGIN 
    BEGIN TRY
    SET NOCOUNT ON;
    BEGIN TRANSACTION 

    IF NOT EXISTS (SELECT 1 FROM Session WHERE SessionID = @sessionid)
    BEGIN 
        RAISERROR('Session ID not found.', 16, 1);
        ROLLBACK;
        RETURN;
    END

    IF NOT EXISTS (SELECT 1
                FROM Session
                WHERE SessionID = @sessionid AND lower(Status) = 'completed'
               )
    BEGIN
        ROLLBACK;
        RAISERROR('Session not yet completed.', 16, 1)
        RETURN
    END

    DECLARE @symptomid INT 

    -- first checking that if symptom exists in records
    SELECT @symptomid= s.SymptomID
    FROM Symptom s
    WHERE lower(TRIM(s.Name)) = lower(TRIM(@SymptomName)) -- if name matches

    IF  @symptomid is NULL -- we need to insert in records
    BEGIN
        INSERT INTO Symptom VALUES
        (@SymptomName)
        SET @symptomid = SCOPE_IDENTITY() -- return last identity value
    END

    INSERT INTO SessionSymptom VALUES 
    (@sessionid,@symptomid)
    COMMIT

    END TRY
    BEGIN CATCH 
            ROLLBACK
            DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
            RAISERROR (@ErrorMessage, 16, 1);
    END CATCH
END 
GO

-- a procedure that take session id and diagnosis name and perform checks and insert accordingly
CREATE PROCEDURE add_sessiondiagnosis
@sessionid INT ,
@DiagnosisName varchar(100) = NULL
AS 
BEGIN 
    BEGIN TRY

    SET NOCOUNT ON;

    BEGIN TRANSACTION 

    IF NOT EXISTS (SELECT 1 FROM Session WHERE SessionID = @sessionid)
    BEGIN 
        RAISERROR('Session ID not found.', 16, 1);
        ROLLBACK;
        RETURN;
    END

    IF NOT EXISTS (SELECT 1
                FROM Session
                WHERE SessionID = @sessionid AND lower(Status) = 'completed'
               )
    BEGIN
        ROLLBACK;
        RAISERROR('Session not yet completed.', 16, 1)
        RETURN
    END

    DECLARE @diagnosisid INT 

    -- first checking that if diagnosis exists in records
    SELECT @diagnosisid= d.DiagnosisID
    FROM diagnosis d
    WHERE lower(TRIM(d.Name)) = lower(TRIM(@diagnosisName)) -- if name matches

    IF  @diagnosisid is NULL -- we need to insert in records
    BEGIN
        INSERT INTO Diagnosis VALUES
        (@DiagnosisName)
        SET @diagnosisid = SCOPE_IDENTITY() -- return last identity value
    END

    INSERT INTO SessionDiagnosis VALUES 
    (@sessionid,@diagnosisid)
    COMMIT

    END TRY
    BEGIN CATCH 
            ROLLBACK
            DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
            RAISERROR (@ErrorMessage, 16, 1);
    END CATCH
END 
GO 


-- a view to display booked session 
CREATE VIEW display_booked_session AS 
SELECT 
    SessionID,
    RoomID,
    SessionType,
    SessionDate,
    CONVERT(VARCHAR(8), StartTime, 108) AS StartTime,
    CONVERT(VARCHAR(8), EndTime, 108) AS EndTime
FROM Session
WHERE LOWER(Status) = 'booked';
GO


-- display completed session
CREATE VIEW display_completed_session AS
SELECT 
    SessionID,
    RoomID,
    SessionType,
    SessionDate,
    CONVERT(VARCHAR(8), StartTime, 108) AS StartTime,
    CONVERT(VARCHAR(8), EndTime, 108) AS EndTime
FROM Session
where lower(status) = 'completed'
GO

-- display cancelled session 
CREATE VIEW display_cancelled_session AS
SELECT     
    SessionID,
    RoomID,
    SessionType,
    SessionDate,
    CONVERT(VARCHAR(8), StartTime, 108) AS StartTime,
    CONVERT(VARCHAR(8), EndTime, 108) AS EndTime
FROM Session
where lower(status) = 'cancelled'
GO

-- display session whose doctors have left 
CREATE VIEW display_docLess_session AS
SELECT 
    SessionID,
    RoomID,
    SessionType,
    SessionDate,
    CONVERT(VARCHAR(8), StartTime, 108) AS StartTime,
    CONVERT(VARCHAR(8), EndTime, 108) AS EndTime
FROM Session
where DoctorID is NULL
GO


-- displaying sessions without symptoms made
CREATE VIEW sym_less_session AS
SELECT  
    SessionID,
    RoomID,
    SessionType,
    SessionDate,
    CONVERT(VARCHAR(8), StartTime, 108) AS StartTime,
    CONVERT(VARCHAR(8), EndTime, 108) AS EndTime
FROM Session
WHERE lower(STATUS) = 'completed' AND sessionID not in (select SessionID FROM SessionSymptom)
GO 

-- displaying sessions without diagnosis made
CREATE VIEW diag_less_session AS
SELECT  
    SessionID,
    RoomID,
    SessionType,
    SessionDate,
    CONVERT(VARCHAR(8), StartTime, 108) AS StartTime,
    CONVERT(VARCHAR(8), EndTime, 108) AS EndTime
FROM Session
WHERE lower(STATUS) = 'completed' AND sessionID not in (select SessionID FROM SessionDiagnosis)
GO

----------------


--PATIENT REPORTS QUERRIES

-- 1. GET PATIENT REPORT

--PATIENT REPORTS QUERRIES

-- 1. GET PATIENT REPORT
DROP PROCEDURE IF EXISTS getpatientreport;
GO
CREATE PROCEDURE getpatientreport
@PatientID INT
AS
BEGIN
    SELECT Name, Age, Gender, BloodGroup, Phone, CNIC 
    FROM Patient 
    WHERE PatientID = @PatientID;

    SELECT s.SessionDate, s.SessionType, d.Name AS DoctorName, dg.Name AS Diagnosis
    FROM Session s
    LEFT JOIN Doctor d ON s.DoctorID = d.DoctorID
    LEFT JOIN SessionDiagnosis sd ON s.SessionID = sd.SessionID
    LEFT JOIN Diagnosis dg ON sd.DiagnosisID = dg.DiagnosisID
    WHERE s.PatientID = @PatientID
    ORDER BY s.SessionDate DESC;

    SELECT m.Name AS Medicine, pr.Quantity, pr.Dosage, pr.Duration
    FROM Session s
    JOIN Prescription pr ON s.SessionID = pr.SessionID
    JOIN Medicines m ON pr.MedicineID = m.MedicineID
    WHERE s.PatientID = @PatientID 
    AND s.Status = 'Completed';
END
GO

-- 2. MOST COMMON DISEASES VIEW
DROP VIEW IF EXISTS vw_MostCommonDiseases;
GO
CREATE VIEW vw_MostCommonDiseases AS
SELECT TOP 5 dg.Name AS Diagnosis, COUNT(*) AS TotalCases
FROM SessionDiagnosis sd
JOIN Diagnosis dg ON sd.DiagnosisID = dg.DiagnosisID
GROUP BY dg.Name
ORDER BY TotalCases DESC
GO

-- 3. PATIENTS BY SYMPTOM
DROP PROCEDURE IF EXISTS getPatientsBySymptom;
GO
CREATE PROCEDURE getPatientsBySymptom
@SymptomName VARCHAR(100)
AS
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Symptom WHERE Name = @SymptomName)
    BEGIN
        RAISERROR('Symptom not found.', 16, 1)
        RETURN
    END
    SELECT DISTINCT p.Name AS PatientName, p.CNIC, p.Phone
    FROM Patient p
    JOIN Session s ON p.PatientID = s.PatientID
    JOIN SessionSymptom ss ON s.SessionID = ss.SessionID
    JOIN Symptom sy ON ss.SymptomID = sy.SymptomID
    WHERE sy.Name = @SymptomName
END
GO

-- 4. ALL PATIENTS SYMPTOMS AND DIAGNOSIS
DROP PROCEDURE IF EXISTS getPatientSymptomDiagnosis;
GO
CREATE PROCEDURE getPatientSymptomDiagnosis
AS
BEGIN
    SELECT p.Name AS PatientName, 
           sy.Name AS Symptom, 
           dg.Name AS Diagnosis,
           s.SessionDate
    FROM Patient p
    JOIN Session s ON p.PatientID = s.PatientID
    JOIN SessionSymptom ss ON s.SessionID = ss.SessionID
    JOIN Symptom sy ON ss.SymptomID = sy.SymptomID
    LEFT JOIN SessionDiagnosis sd ON s.SessionID = sd.SessionID
    LEFT JOIN Diagnosis dg ON sd.DiagnosisID = dg.DiagnosisID
    ORDER BY p.Name, s.SessionDate DESC
END
GO

-- 5. MOST COMMON SYMPTOMS VIEW

DROP VIEW IF EXISTS vw_MostCommonSymptoms;
GO
CREATE VIEW vw_MostCommonSymptoms AS
SELECT TOP 5 sy.Name AS Symptom, COUNT(*) AS TotalOccurrences
FROM SessionSymptom ss
JOIN Symptom sy ON ss.SymptomID = sy.SymptomID
GROUP BY sy.Name
ORDER BY TotalOccurrences DESC
GO

-- 6. DIAGNOSIS SUGGESTION

DROP PROCEDURE IF EXISTS getDiagnosisSuggestion;
GO
CREATE PROCEDURE getDiagnosisSuggestion
@Symptom1 VARCHAR(100),
@Symptom2 VARCHAR(100) = NULL
AS
BEGIN
    SELECT TOP 1 
           dg.Name AS SuggestedDiagnosis, 
           ds.ConfidenceLevel,
           COUNT(*) AS MatchedSymptoms
    FROM DiagnosisSuggestion ds
    JOIN SuggestionSymptom ss ON ds.SuggestionID = ss.SuggestionID
    JOIN Symptom sy ON ss.SymptomID = sy.SymptomID
    JOIN SuggestionDiagnosis sd ON ds.SuggestionID = sd.SuggestionID
    JOIN Diagnosis dg ON sd.DiagnosisID = dg.DiagnosisID
    WHERE sy.Name = @Symptom1 
    OR (@Symptom2 IS NOT NULL AND sy.Name = @Symptom2)
    GROUP BY dg.Name, ds.ConfidenceLevel
    ORDER BY MatchedSymptoms DESC, ds.ConfidenceLevel DESC
END
GO

-- 8. ALL SUGGESTIONS VIEW

DROP VIEW IF EXISTS vw_AllSuggestions;
GO
CREATE VIEW vw_AllSuggestions AS
SELECT ds.SuggestionID,
       sy.Name AS Symptom,
       dg.Name AS Diagnosis,
       ds.ConfidenceLevel
FROM DiagnosisSuggestion ds
JOIN SuggestionSymptom ss ON ds.SuggestionID = ss.SuggestionID
JOIN Symptom sy ON ss.SymptomID = sy.SymptomID
JOIN SuggestionDiagnosis sd ON ds.SuggestionID = sd.SuggestionID
JOIN Diagnosis dg ON sd.DiagnosisID = dg.DiagnosisID
GO

-- 9. PATIENTS BY DISEASE

DROP PROCEDURE IF EXISTS getPatientsByDisease;
GO
CREATE PROCEDURE getPatientsByDisease
@DiagnosisName VARCHAR(100)
AS
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Diagnosis WHERE Name = @DiagnosisName)
    BEGIN
        RAISERROR('Diagnosis not found.', 16, 1)
        RETURN
    END
    SELECT DISTINCT p.Name AS PatientName, 
                    p.CNIC, 
                    p.Phone,
                    p.BloodGroup,
                    s.SessionDate
    FROM Patient p
    JOIN Session s ON p.PatientID = s.PatientID
    JOIN SessionDiagnosis sd ON s.SessionID = sd.SessionID
    JOIN Diagnosis dg ON sd.DiagnosisID = dg.DiagnosisID
    WHERE dg.Name = @DiagnosisName
    ORDER BY s.SessionDate DESC
END
GO


--DIAGNOSIS TABLE QUERRIES
--ADD DIAGNOSIS
DROP PROCEDURE IF EXISTS addDiagnosis;
GO
CREATE PROCEDURE addDiagnosis
@Name VARCHAR(100)
AS
BEGIN
    IF @Name IS NULL OR LTRIM(RTRIM(@Name)) = ''
    BEGIN
        RAISERROR('Diagnosis name cannot be empty.', 16, 1)
        RETURN
    END

    IF EXISTS (SELECT 1 FROM Diagnosis WHERE lower(Name) = lower(@Name))
    BEGIN
        RAISERROR('This diagnosis already exists.', 16, 1)
        RETURN
    END

    INSERT INTO Diagnosis (Name) VALUES (@Name)
    SELECT SCOPE_IDENTITY() AS NewDiagnosisID, 'Diagnosis added successfully' AS Message
END
GO

--VIEW DIAGNOSIS
DROP PROCEDURE IF EXISTS viewDiagnosisDetails;
GO
CREATE PROCEDURE viewDiagnosisDetails
@DiagnosisID INT
AS
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Diagnosis WHERE DiagnosisID = @DiagnosisID)
    BEGIN
        RAISERROR('Diagnosis not found.', 16, 1)
        RETURN
    END

    SELECT DiagnosisID, Name
    FROM Diagnosis
    WHERE DiagnosisID = @DiagnosisID;

    SELECT p.Name AS PatientName, s.SessionDate, s.SessionType
    FROM SessionDiagnosis sd
    JOIN Session s ON sd.SessionID = s.SessionID
    JOIN Patient p ON s.PatientID = p.PatientID
    WHERE sd.DiagnosisID = @DiagnosisID
    ORDER BY s.SessionDate DESC;

    SELECT ds.SuggestionID, ds.ConfidenceLevel
    FROM SuggestionDiagnosis sd
    JOIN DiagnosisSuggestion ds ON sd.SuggestionID = ds.SuggestionID
    WHERE sd.DiagnosisID = @DiagnosisID;
END
GO

--EDIT DIAGNOSIS
DROP PROCEDURE IF EXISTS editDiagnosis;
GO
CREATE PROCEDURE editDiagnosis
@DiagnosisID INT,
@Name VARCHAR(100) = NULL
AS
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Diagnosis WHERE DiagnosisID = @DiagnosisID)
    BEGIN
        RAISERROR('Diagnosis not found.', 16, 1)
        RETURN
    END

    IF @Name IS NOT NULL AND LTRIM(RTRIM(@Name)) = ''
    BEGIN
        RAISERROR('Diagnosis name cannot be empty.', 16, 1)
        RETURN
    END

    IF @Name IS NOT NULL AND EXISTS (
        SELECT 1 FROM Diagnosis
        WHERE lower(Name) = lower(@Name)
        AND DiagnosisID != @DiagnosisID
    )
    BEGIN
        RAISERROR('This diagnosis name already exists.', 16, 1)
        RETURN
    END

    UPDATE Diagnosis
    SET Name = ISNULL(@Name, Name)
    WHERE DiagnosisID = @DiagnosisID

    SELECT DiagnosisID, Name,
    'Diagnosis updated successfully' AS Message
    FROM Diagnosis
    WHERE DiagnosisID = @DiagnosisID
END
GO

--DELETE DIAGNOSIS
DROP PROCEDURE IF EXISTS deleteDiagnosis;
GO
CREATE PROCEDURE deleteDiagnosis
@DiagnosisID INT
AS
BEGIN
    SET NOCOUNT ON

    IF NOT EXISTS (SELECT 1 FROM Diagnosis WHERE DiagnosisID = @DiagnosisID)
    BEGIN
        RAISERROR('Diagnosis not found.', 16, 1)
        RETURN
    END

    IF EXISTS (SELECT 1 FROM SessionDiagnosis WHERE DiagnosisID = @DiagnosisID)
    BEGIN
        RAISERROR('Cannot delete. This diagnosis is linked to patient sessions.', 16, 1)
        RETURN
    END

    IF EXISTS (SELECT 1 FROM SuggestionDiagnosis WHERE DiagnosisID = @DiagnosisID)
    BEGIN
        RAISERROR('Cannot delete. This diagnosis is linked to suggestions.', 16, 1)
        RETURN
    END

    DELETE FROM Diagnosis WHERE DiagnosisID = @DiagnosisID
    SELECT 'Diagnosis deleted successfully' AS Message
END
GO

--SUGGESTION QUERRIES

--ADD SUGGESTIONS
DROP PROCEDURE IF EXISTS addSuggestion;
GO
CREATE PROCEDURE addSuggestion
@DiagnosisID INT,
@ConfidenceLevel DECIMAL(5,2),
@Symptom1ID INT,
@Symptom2ID INT = NULL
AS
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Diagnosis WHERE DiagnosisID = @DiagnosisID)
    BEGIN
        RAISERROR('Diagnosis not found.', 16, 1)
        RETURN
    END

    IF NOT EXISTS (SELECT 1 FROM Symptom WHERE SymptomID = @Symptom1ID)
    BEGIN
        RAISERROR('Symptom not found.', 16, 1)
        RETURN
    END

    IF @ConfidenceLevel < 0 OR @ConfidenceLevel > 100
    BEGIN
        RAISERROR('Confidence level must be between 0 and 100.', 16, 1)
        RETURN
    END

    IF EXISTS (
        SELECT 1 FROM SuggestionDiagnosis sd
        JOIN SuggestionSymptom ss ON sd.SuggestionID = ss.SuggestionID
        WHERE sd.DiagnosisID = @DiagnosisID
        AND ss.SymptomID = @Symptom1ID
    )
    BEGIN
        RAISERROR('This suggestion already exists.', 16, 1)
        RETURN
    END

    DECLARE @newID INT
    INSERT INTO DiagnosisSuggestion (ConfidenceLevel) VALUES (@ConfidenceLevel)
    SET @newID = SCOPE_IDENTITY()

    INSERT INTO SuggestionSymptom (SuggestionID, SymptomID) VALUES (@newID, @Symptom1ID)

    IF @Symptom2ID IS NOT NULL
        INSERT INTO SuggestionSymptom (SuggestionID, SymptomID) VALUES (@newID, @Symptom2ID)

    INSERT INTO SuggestionDiagnosis (SuggestionID, DiagnosisID) VALUES (@newID, @DiagnosisID)

    SELECT @newID AS NewSuggestionID, 'Suggestion added successfully' AS Message
END
GO

-- VIEW SUGGESTIONS
DROP PROCEDURE IF EXISTS viewSuggestionDetails;
GO
CREATE PROCEDURE viewSuggestionDetails
@SuggestionID INT
AS
BEGIN
    IF NOT EXISTS (SELECT 1 FROM DiagnosisSuggestion WHERE SuggestionID = @SuggestionID)
    BEGIN
        RAISERROR('Suggestion not found.', 16, 1)
        RETURN
    END

    SELECT SuggestionID, ConfidenceLevel
    FROM DiagnosisSuggestion
    WHERE SuggestionID = @SuggestionID;

    SELECT sy.SymptomID, sy.Name AS SymptomName
    FROM SuggestionSymptom ss
    JOIN Symptom sy ON ss.SymptomID = sy.SymptomID
    WHERE ss.SuggestionID = @SuggestionID;

    SELECT dg.DiagnosisID, dg.Name AS DiagnosisName
    FROM SuggestionDiagnosis sd
    JOIN Diagnosis dg ON sd.DiagnosisID = dg.DiagnosisID
    WHERE sd.SuggestionID = @SuggestionID;
END
GO

--CHANGE SUGGESTION
DROP PROCEDURE IF EXISTS editSuggestionConfidence;
GO
CREATE PROCEDURE editSuggestionConfidence
@SuggestionID INT,
@NewConfidenceLevel DECIMAL(5,2) = NULL
AS
BEGIN
    IF NOT EXISTS (SELECT 1 FROM DiagnosisSuggestion WHERE SuggestionID = @SuggestionID)
    BEGIN
        RAISERROR('Suggestion not found.', 16, 1)
        RETURN
    END

    IF @NewConfidenceLevel IS NOT NULL AND (@NewConfidenceLevel < 0 OR @NewConfidenceLevel > 100)
    BEGIN
        RAISERROR('Confidence level must be between 0 and 100.', 16, 1)
        RETURN
    END

    UPDATE DiagnosisSuggestion
    SET ConfidenceLevel = ISNULL(@NewConfidenceLevel, ConfidenceLevel)
    WHERE SuggestionID = @SuggestionID

    SELECT SuggestionID, ConfidenceLevel,
    'Confidence level updated successfully' AS Message
    FROM DiagnosisSuggestion
    WHERE SuggestionID = @SuggestionID
END
GO

--DELETE SUGGESTION
DROP PROCEDURE IF EXISTS deleteSuggestion;
GO
CREATE PROCEDURE deleteSuggestion
@SuggestionID INT
AS
BEGIN
    SET NOCOUNT ON

    IF NOT EXISTS (SELECT 1 FROM DiagnosisSuggestion WHERE SuggestionID = @SuggestionID)
    BEGIN
        RAISERROR('Suggestion not found.', 16, 1)
        RETURN
    END

    DECLARE @diagid INT
    SELECT @diagid = DiagnosisID FROM SuggestionDiagnosis
    WHERE SuggestionID = @SuggestionID

    IF EXISTS (
        SELECT 1 FROM SessionDiagnosis sd
        JOIN SessionSymptom ss ON sd.SessionID = ss.SessionID
        JOIN SuggestionSymptom ssy ON ss.SymptomID = ssy.SymptomID
        WHERE sd.DiagnosisID = @diagid
        AND ssy.SuggestionID = @SuggestionID
    )
    BEGIN
        RAISERROR('Cannot delete. Patient sessions are linked to this suggestion.', 16, 1)
        RETURN
    END

    DELETE FROM DiagnosisSuggestion WHERE SuggestionID = @SuggestionID
    SELECT 'Suggestion deleted successfully' AS Message
END
GO
DROP VIEW IF EXISTS view_sym;
GO
CREATE VIEW view_sym AS
SELECT SymptomID, Name
FROM Symptom;
GO
 
-- Drop and recreate view_dia
DROP VIEW IF EXISTS view_dia;
GO
CREATE VIEW view_dia AS
SELECT DiagnosisID, Name
FROM Diagnosis;
GO
 
---- Verify both views return data
--SELECT * FROM view_sym ORDER BY SymptomID;
--SELECT * FROM view_dia ORDER BY DiagnosisID;
--GO


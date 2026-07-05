
const sql = require('mssql/msnodesqlv8');
const config = require('./dbconfig');
const express = require('express');
const cors = require('cors'); // ✅ Add this
const app = express();

app.use(cors());              // ✅ Add this
app.use(express.json());
app.listen(3000, function () {
    console.log('Server running on port 3000');
});
// session cancellation stuff
app.post('/cancelsession', async function (req, res) {
    let sessionid = parseInt(req.body.sessionid);

    let pool = await sql.connect(config);

    await pool.request()
        .input("sessid", sql.Int, sessionid)
        .execute("deletesession")
    await pool.close();
    res.json({ success: true, message: 'Session cancelled successfully' });
});
app.post('/getsessions', async function name(req, res) {
    let cnic = req.body.cnic
    let pool = await sql.connect(config);
    let sessdetails = await pool.request()
        .input("cnic", sql.VarChar, cnic)
        .execute("sessiondetails")
    await pool.close()
    res.json({ data: sessdetails.recordset })

})
// session booking stuff
function addTime(starttime, minutes) {
    let [hours, mins] = starttime.split(':').map(Number);

    mins += minutes;


    hours += Math.floor(mins / 60);
    mins = mins % 60;


    hours = hours % 24;


    let formattedHours = String(hours).padStart(2, '0');
    let formattedMins = String(mins).padStart(2, '0');

    return `${formattedHours}:${formattedMins}`;
}
app.post('/checkpatient', async function (req, res) {
    const cnic = req.body.cnic
    let pool = await sql.connect(config);
    let patientdetails = await pool.request()
        .input("cnic", sql.VarChar, cnic)
        .execute("getPatient")
    await pool.close()
    res.json({ data: patientdetails.recordset })

}
)
app.post('/registerPatient', async (req, res) => {
    let pool = await sql.connect(config);
    await pool.request()
        .input('cnic', sql.VarChar, req.body.cnic)
        .input('name', sql.VarChar, req.body.name)
        .input('age', sql.Int, parseInt(req.body.age))
        .input('gender', sql.Char, req.body.gender)
        .input('bloodGroup', sql.VarChar, req.body.bloodGroup)
        .input('phone', sql.VarChar, req.body.phone)
        .execute("addpatient");
    await pool.close()
    res.json({ message: 'Success' })

}
)
app.get('/getDoctors', async (req, res) => {
    let pool = await sql.connect(config);
    let result = await pool.request().execute('getDoctor');
    await pool.close();
    res.json({ details: result.recordset });
});
app.post('/getSessionDetails', async (req, res) => {
    let pool = await sql.connect(config);
    let result = await pool.request()
        .input('docid', sql.Int, parseInt(req.body.docid))
        .execute('getBookedSessions');
    await pool.close();
    res.json({ sessdetails: result.recordset });
});
app.post('/getunpaidsessions', async function (req, res) {
    let pool = await sql.connect(config);
    let result = await pool.request()
        .input('sessid', sql.Int, req.body.sessid)
        .execute('unpaid_Patientsession');
    await pool.close();
    res.json({ sess_details: result.recordset });

});
app.post('/schedulesession', async function (req, res) {
    let pool = await sql.connect(config);


    let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let doctorid = parseInt(req.body.doctorid);
    let sessiontype = req.body.sessiontype;
    let sessiondate = req.body.sessiondate;                                    // plain string ✅
    let sessionday = days[new Date(sessiondate + 'T00:00:00Z').getUTCDay()]; // UTC day ✅
    let starttime = req.body.starttime;
    let endtime;

    //computing the end time manually can be hard-coded if you want end-time according to the will of the patient
    if (sessiontype == 'Consultation') {
        endtime = addTime(starttime, 15)
    }
    else if (sessiontype == 'Operation') {
        endtime = addTime(starttime, 60)
    }
    let getdoctortime = await pool.request()
        .input('docid', sql.Int, doctorid)
        .input('appointmentday', sql.VarChar, sessionday)
        .execute('getDoctorTime')

    //we have to check via HTML to see if the time slot exists or not
    if (getdoctortime.recordset.length == 0 || getdoctortime.recordset[0].StartTime == null || getdoctortime.recordset[0].EndTime == null) {
        await pool.close()
        return res.json({ success: false, message: 'Doctor not available on this day' })
    }



    let docstarttime = getdoctortime.recordset[0].StartTime.toISOString().slice(11, 16)
    let docendtime = getdoctortime.recordset[0].EndTime.toISOString().slice(11, 16)

    if (starttime < docstarttime || endtime > docendtime) {
        await pool.close();
        res.json
            (
                {
                    message: 'Doctor not available in this time',
                    success: false
                }

            )
        return;

    }
    // start time and end time are that of the patients
    let checkotherpatienttimes = await pool.request()
        .input("sttime", sql.Time, starttime)
        .input("end_time", sql.Time, endtime)
        .input("sessdate", sql.Date, sessiondate)
        .input("docid", sql.Int, doctorid)
        .execute('checkTimeConflict')

    if (checkotherpatienttimes.recordset.length != 0) {
        await pool.close();
        res.json
            (
                {
                    message: 'This timeslot is not free',
                    success: false
                }

            )
        return;

    }


    //we have set 3% discount for every previous consultation and 5% in case of operation

    let patdetail = await pool.request()
        .input("cnic", sql.VarChar, req.body.cnic)
        .execute('getPatientID')

    let patid = patdetail.recordset[0].PatientID
    let pastappoint_ = await pool.request()
        .input("patid", sql.Int, patid)
        .input("docid", sql.Int, doctorid)
        .input("type", sql.VarChar, sessiontype)
        .execute('getPastAppointments')

    let disc_percent = 0
    if (pastappoint_.recordset[0].apptcount != 0) {

        if (sessiontype == 'Consultation') {
            disc_percent = 3;
            disc_percent *= pastappoint_.recordset[0].apptcount;

        }
        else {
            disc_percent = 5;
            disc_percent *= pastappoint_.recordset[0].apptcount;

        }
    }
    let avail_room = await pool.request()
        .input('type', sql.VarChar, sessiontype)
        .input('sttime', sql.Time, starttime)
        .input('endtime', sql.Time, endtime)
        .input('sessdate', sql.Date, sessiondate)
        .execute('getAvailableRoom')

    if (avail_room.recordset.length == 0) {
        await pool.close();
        res.json
            (
                {
                    success: false,
                    message: 'No room available'
                }

            )
        return

    }
    let roomid = avail_room.recordset[0].RoomID
    let doccharges = await pool.request()
        .input('docid', sql.Int, doctorid)
        .input('type', sql.VarChar, sessiontype)
        .execute('getDoctorCharges')
    if (doccharges.recordset.length === 0) {
        res.json
            (
                {
                    success: false,
                    message: 'The doctor does not offer this session'
                }

            )
        return
    }
    if (doccharges.recordset[0].Charges == null) {
        res.json
            (
                {
                    success: false,
                    message: 'Charges for this doctor are not set yet'
                }

            )
        return


    }

    let sess_amount = doccharges.recordset[0].Charges * (1 - (disc_percent / 100))
    await pool.request()
        .input('docid', sql.Int, doctorid)
        .input('type', sql.VarChar, sessiontype)
        .input("sttime", sql.Time, starttime)
        .input("end_time", sql.Time, endtime)
        .input("sessdate", sql.Date, sessiondate)
        .input("sesscharges", sql.Decimal(10, 2), sess_amount)
        .input("status", sql.VarChar, 'Booked')
        .input('patid', sql.Int, patid)
        .input('roomid', sql.Int, roomid)
        .execute('insertSession')

    let sessiondetails = await pool.request()
        .execute('getLatestSession')

    await pool.close();
    res.json
        (
            {
                success: true,
                message: sessiondetails.recordset
            }

        )
}
);
// billing stuff
app.post('/dues', async (req, res) => {
    let pool = await sql.connect(config);
    let details = await pool.request()
        .input("patientID", sql.Int, req.body.patid)
        .execute('unpaid_Patientsession')
    await pool.close()
    res.json({
        success: true,
        data: details.recordset
    })

}
);


app.post('/gettotal', async (req, res) => {
    let pool = await sql.connect(config);
    let result = await pool.request()
        .input('session_id', sql.Int, req.body.sessionid)
        .output('total', sql.Decimal(10, 2))
        .execute('generate_bill')
    await pool.close()
    res.json({ success: true, total: result.output.total })
});

// AnalyzeProfits stuff

app.get('/getalldoctors', async (req, res) => {
    let pool = await sql.connect(config);
    const response = await pool.request().query('Select * from viewdoctors')
    res.json({ data: response.recordset })
    await pool.close()


})




app.get('/getalldepartments', async (req, res) => {
    let pool = await sql.connect(config);
    const response = await pool.request().query('Select * from viewdepartments')
    res.json({ data: response.recordset })
    await pool.close()


})


app.post('/getdoctortotal', async (req, res) => {
    const { doctorid, startdate, enddate } = req.body

    const pool = await sql.connect(config)
    const result = await pool.request()
        .input('d_id', sql.Int, doctorid)
        .input('startdate', sql.Date, startdate)
        .input('enddate', sql.Date, enddate)
        .output('total', sql.Int)
        .execute('gettotaldocearnings')

    const total = result.output.total
    await pool.close()

    res.json({ success: true, total: total })
})
app.post('/getdepartmenttotal', async (req, res) => {
    const { dept_id, startdate, enddate } = req.body

    const pool = await sql.connect(config)
    const result = await pool.request()
        .input('dept_id', sql.Int, dept_id)
        .input('startdate', sql.Date, startdate)
        .input('enddate', sql.Date, enddate)
        .output('total', sql.Int)
        .execute('departmenttotal')

    const total = result.output.total
    await pool.close()

    res.json({ success: true, total: total })
})




// Managing doctors backend


app.get('/getDoctorList', async (req, res) => {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request()
            .query('SELECT * FROM vw_DoctorList');
        await pool.close();
        res.json({ data: result.recordset });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
});

app.get('/getFreeDoctors', async (req, res) => {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request()
            .query('SELECT * FROM display_freeDoc');
        await pool.close();
        res.json({ data: result.recordset });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
});

app.get('/getDualDoctors', async (req, res) => {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request()
            .query('SELECT * FROM dual_doctor');
        await pool.close();
        res.json({ data: result.recordset });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
});



app.post('/addDoctor', async (req, res) => {
    try {
        let pool = await sql.connect(config);
        await pool.request()
            .input('name', sql.VarChar(100), req.body.name)
            .input('age', sql.Int, req.body.age)
            .input('gender', sql.Char(1), req.body.gender)
            .input('specialization', sql.VarChar(100), req.body.specialization)
            .execute('addDoctor');
        await pool.close();
        res.json({ success: true, message: 'Doctor added successfully' });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
});

app.get('/viewDoctorDetails/:id', async (req, res) => {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request()
            .input('docid', sql.Int, req.params.id)
            .execute('viewDoctorDetails');
        await pool.close();
        res.json({ data: result.recordset[0] });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
});

app.get('/viewDoctorAvailability/:id', async (req, res) => {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request()
            .input('docid', sql.Int, req.params.id)
            .execute('viewDoctorAvailability');
        await pool.close();
        res.json({ data: result.recordset });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
});

app.get('/viewDoctorCharges/:id', async (req, res) => {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request()
            .input('docid', sql.Int, req.params.id)
            .execute('viewDoctorCharges');
        await pool.close();
        res.json({ data: result.recordset });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
});

app.put('/editDoctorInfo/:id', async (req, res) => {
    try {
        let pool = await sql.connect(config);
        await pool.request()
            .input('docid', sql.Int, req.params.id)
            .input('name', sql.VarChar(100), req.body.name ?? null)
            .input('age', sql.Int, req.body.age ?? null)
            .input('gender', sql.Char(1), req.body.gender ?? null)
            .input('specialization', sql.VarChar(100), req.body.specialization ?? null)
            .execute('editDoctorInfo');
        await pool.close();
        res.json({ success: true, message: 'Doctor info updated successfully' });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
});

app.put('/editDoctorAvailability/:timeID', async (req, res) => {
    try {
        let pool = await sql.connect(config);
        await pool.request()
            .input('timeID', sql.Int, req.params.timeID)
            .input('dayOfWeek', sql.VarChar(10), req.body.dayOfWeek ?? null)
            .input('startTime', sql.Time, req.body.startTime ?? null)
            .input('endTime', sql.Time, req.body.endTime ?? null)
            .execute('editDoctorAvailability');
        await pool.close();
        res.json({ success: true, message: 'Doctor availability updated successfully' });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
});

app.put('/editDoctorCharges/:chargeID', async (req, res) => {
    try {
        let pool = await sql.connect(config);
        await pool.request()
            .input('chargeID', sql.Int, req.params.chargeID)
            .input('sessionType', sql.VarChar(20), req.body.sessionType ?? null)
            .input('newCharges', sql.Decimal(10, 2), req.body.newCharges ?? null)
            .execute('editDoctorCharges');
        await pool.close();
        res.json({ success: true, message: 'Doctor charges updated successfully' });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
});

app.get('/getDoctorTotalEarnings/:id', async (req, res) => {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request()
            .input('docid', sql.Int, req.params.id)
            .execute('getDoctorTotalEarnings');
        await pool.close();
        res.json({ data: result.recordset[0] });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
});

app.delete('/deleteDoctor/:id', async (req, res) => {
    try {
        let pool = await sql.connect(config);
        await pool.request()
            .input('docid', sql.Int, req.params.id)
            .execute('deleteDoctor');
        await pool.close();
        res.json({ success: true, message: 'Doctor deleted successfully' });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
});
//-----------------------------



// ----   Pharmacy backend 

app.get('/getMedicines', async (req, res) => {
    let pool = await sql.connect(config);
    let result = await pool.request()
        .query('SELECT * FROM PharmacyInventory');
    await pool.close();
    res.json({ data: result.recordset });
});

app.get('/top5medUsed', async (req, res) => {
    let pool = await sql.connect(config);
    let result = await pool.request()
        .query('Select* FROM top_5_med_use');
    await pool.close();
    res.json({ data: result.recordset })
})

app.get('/top5MedProfits', async (req, res) => {
    let pool = await sql.connect(config);
    let result = await pool.request()
        .query('Select* FROM top_5_med_profits');
    await pool.close();
    res.json({ data: result.recordset })
})

app.post('/addMedicine', async (req, res) => {
    try {
        let pool = await sql.connect(config);

        await pool.request()
            .input('Name', sql.VarChar(100), req.body.Name)
            .input('Type', sql.VarChar(50), req.body.Type)
            .input('Price', sql.Decimal(10, 2), req.body.Price)
            .input('MinStock', sql.Int, req.body.MinStock)
            .execute('insert_medicine');

        await pool.close();
        res.json({ success: true, message: 'Medicine inserted successfully' });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
});

app.post('/addMedicineStock', async (req, res) => {
    try {
        let pool = await sql.connect(config);

        await pool.request()
            .input('MedicineID', sql.Int, req.body.ID)
            .input('addQuantity', sql.Int, req.body.stock)
            .execute('add_stock');

        await pool.close();
        res.json({ success: true, message: 'Stock added successfully' });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
});



// Manage sessions 


app.get('/getBookedSessions', async (req, res) => {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request()
            .query('SELECT * FROM display_booked_session');
        await pool.close();
        res.json({ data: result.recordset });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
});

app.get('/getCompletedSessions', async (req, res) => {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request()
            .query('SELECT * FROM display_completed_session');
        await pool.close();
        res.json({ data: result.recordset });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
});

app.get('/getCancelledSessions', async (req, res) => {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request()
            .query('SELECT * FROM display_cancelled_session');
        await pool.close();
        res.json({ data: result.recordset });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
});

app.get('/getDocLessSessions', async (req, res) => {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request()
            .query('SELECT * FROM display_docLess_session');
        await pool.close();
        res.json({ data: result.recordset });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
});

app.get('/getSymLessSessions', async (req, res) => {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request()
            .query('SELECT * FROM sym_less_session');
        await pool.close();
        res.json({ data: result.recordset });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
});

app.get('/getDiagLessSessions', async (req, res) => {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request()
            .query('SELECT * FROM diag_less_session');
        await pool.close();
        res.json({ data: result.recordset });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
});


// Call this on page load 
// Returns list of completed sessions that have no billing record yet
app.get('/promptSession', async (req, res) => {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request()
            .execute('prompt_session');
        await pool.close();
        res.json({ data: result.recordset });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
});

// 9. POST /handlePrescriptionDecision  →  handle_prescription_decision
// Decision: 'yes' → returns OPEN_FORM action | 'no' → inserts billing with 0 medicine charges
app.post('/handlePrescriptionDecision', async (req, res) => {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request()
            .input('SessionID', sql.Int, req.body.sessionID)
            .input('Decision', sql.Char(3), req.body.decision)
            .execute('handle_prescription_decision');
        await pool.close();

        // If decision was 'yes', result.recordset[0] will have { Action: 'OPEN_FORM', SessionID: ... }
        // If decision was 'no', billing is inserted and recordset will be empty
        const actionRow = result.recordset && result.recordset[0];
        if (actionRow && actionRow.Action === 'OPEN_FORM') {
            res.json({ action: 'OPEN_FORM', sessionID: actionRow.SessionID });
        } else {
            res.json({ success: true, message: 'Billing created with no medicine charges' });
        }
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
});

// 10. POST /addPrescription  →  add_prescription
// Call in a loop for each medicine the user wants to add
app.post('/addPrescription', async (req, res) => {
    try {
        let pool = await sql.connect(config);
        await pool.request()
            .input('sessionID', sql.Int, req.body.sessionID)
            .input('MedicineID', sql.Int, req.body.medicineID)
            .input('Quantity', sql.Int, req.body.quantity)
            .input('Dosage', sql.VarChar(100), req.body.dosage)
            .input('duration', sql.VarChar(50), req.body.duration)
            .execute('add_prescription');
        await pool.close();
        res.json({ success: true, message: 'Prescription added successfully' });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
});

app.post('/addSessionSymptom', async (req, res) => {
    try {
        let pool = await sql.connect(config);
        await pool.request()
            .input('sessionid', sql.Int, req.body.sessionID)
            .input('SymptomName', sql.VarChar(100), req.body.symptomName ?? null)
            .execute('add_sessionsymptom');
        await pool.close();
        res.json({ success: true, message: 'Symptom added to session successfully' });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
});

app.post('/addSessionDiagnosis', async (req, res) => {
    try {
        let pool = await sql.connect(config);
        await pool.request()
            .input('sessionid', sql.Int, req.body.sessionID)
            .input('DiagnosisName', sql.VarChar(100), req.body.diagnosisName ?? null)
            .execute('add_sessiondiagnosis');
        await pool.close();
        res.json({ success: true, message: 'Diagnosis added to session successfully' });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
});
//-----------------------------



// 1. GET PATIENT REPORT
// 1. GET PATIENT REPORT
app.get('/getpatientreport/:patientid', async function (req, res) {
    try {
        let patientid = parseInt(req.params.patientid);
        let pool = await sql.connect(config);
        let result = await pool.request()
            .input('PatientID', sql.Int, patientid)
            .execute('getpatientreport');
        await pool.close();
        res.json({
            success: true,
            patientInfo: result.recordsets[0],
            visitHistory: result.recordsets[1],
            prescriptions: result.recordsets[2]
        });
    }
    catch (err) {
        res.json({ success: false, message: err.message });
    }
});

// 2. MOST COMMON DISEASES VIEW
app.get('/mostcommondiseases', async function (req, res) {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request()
            .query('SELECT * FROM vw_MostCommonDiseases');
        await pool.close();
        res.json({ success: true, data: result.recordset });
    }
    catch (err) {
        res.json({ success: false, message: err.message });
    }
});

// 3. PATIENTS BY SYMPTOM
app.post('/patientsbysymptom', async function (req, res) {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request()
            .input('SymptomName', sql.VarChar(100), req.body.symptomname)
            .execute('getPatientsBySymptom');
        await pool.close();
        res.json({ success: true, data: result.recordset });
    }
    catch (err) {
        res.json({ success: false, message: err.message });
    }
});

// 4. ALL PATIENTS SYMPTOMS AND DIAGNOSIS
app.get('/patientsymptomsdiagnosis', async function (req, res) {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request()
            .execute('getPatientSymptomDiagnosis');
        await pool.close();
        res.json({ success: true, data: result.recordset });
    }
    catch (err) {
        res.json({ success: false, message: err.message });
    }
});

// 5. MOST COMMON SYMPTOMS VIEW
app.get('/mostcommonsymptoms', async function (req, res) {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request()
            .query('SELECT * FROM vw_MostCommonSymptoms');
        await pool.close();
        res.json({ success: true, data: result.recordset });
    }
    catch (err) {
        res.json({ success: false, message: err.message });
    }
});

// 6. DIAGNOSIS SUGGESTION
app.post('/getdiagnosissuggestion', async function (req, res) {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request()
            .input('Symptom1', sql.VarChar(100), req.body.symptom1)
            .input('Symptom2', sql.VarChar(100), req.body.symptom2 || null)
            .execute('getDiagnosisSuggestion');
        await pool.close();
        res.json({ success: true, data: result.recordset });
    }
    catch (err) {
        res.json({ success: false, message: err.message });
    }
});

// 7. ALL SUGGESTIONS VIEW
app.get('/allsuggestions', async function (req, res) {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request()
            .query('SELECT * FROM vw_AllSuggestions ORDER BY ConfidenceLevel DESC');
        await pool.close();
        res.json({ success: true, data: result.recordset });
    }
    catch (err) {
        res.json({ success: false, message: err.message });
    }
});

// 8. PATIENTS BY DISEASE
app.post('/patientsbydisease', async function (req, res) {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request()
            .input('DiagnosisName', sql.VarChar(100), req.body.diagnosisname)
            .execute('getPatientsByDisease');
        await pool.close();
        res.json({ success: true, data: result.recordset });
    }
    catch (err) {
        res.json({ success: false, message: err.message });
    }
});

// S1. ADD SUGGESTION
app.post('/addsuggestion', async function (req, res) {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request()
            .input('DiagnosisID', sql.Int, parseInt(req.body.diagnosisid))
            .input('ConfidenceLevel', sql.Decimal(5, 2), parseFloat(req.body.confidencelevel))
            .input('Symptom1ID', sql.Int, parseInt(req.body.symptom1id))
            .input('Symptom2ID', sql.Int, req.body.symptom2id ? parseInt(req.body.symptom2id) : null)
            .execute('addSuggestion');
        await pool.close();
        res.json({ success: true, data: result.recordset });
    }
    catch (err) {
        res.json({ success: false, message: err.message });
    }
});

// S2. VIEW SUGGESTION DETAILS
app.get('/viewsuggestion/:suggestionid', async function (req, res) {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request()
            .input('SuggestionID', sql.Int, parseInt(req.params.suggestionid))
            .execute('viewSuggestionDetails');
        await pool.close();
        res.json({
            success: true,
            suggestionInfo: result.recordsets[0],
            symptoms: result.recordsets[1],
            diagnosis: result.recordsets[2]
        });
    }
    catch (err) {
        res.json({ success: false, message: err.message });
    }
});

// S3. EDIT SUGGESTION CONFIDENCE
app.put('/editsuggestion/:suggestionid', async function (req, res) {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request()
            .input('SuggestionID', sql.Int, parseInt(req.params.suggestionid))
            .input('NewConfidenceLevel', sql.Decimal(5, 2), req.body.confidencelevel != null ? parseFloat(req.body.confidencelevel) : null)
            .execute('editSuggestionConfidence');
        await pool.close();
        res.json({ success: true, data: result.recordset });
    }
    catch (err) {
        res.json({ success: false, message: err.message });
    }
});

// S4. DELETE SUGGESTION
app.delete('/deletesuggestion/:suggestionid', async function (req, res) {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request()
            .input('SuggestionID', sql.Int, parseInt(req.params.suggestionid))
            .execute('deleteSuggestion');
        await pool.close();
        res.json({ success: true, data: result.recordset });
    }
    catch (err) {
        res.json({ success: false, message: err.message });
    }
});

// D1. ADD DIAGNOSIS
app.post('/adddiagnosis', async function (req, res) {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request()
            .input('Name', sql.VarChar(100), req.body.name)
            .execute('addDiagnosis');
        await pool.close();
        res.json({ success: true, data: result.recordset });
    }
    catch (err) {
        res.json({ success: false, message: err.message });
    }
});

// D2. VIEW DIAGNOSIS DETAILS
app.get('/viewdiagnosis/:diagnosisid', async function (req, res) {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request()
            .input('DiagnosisID', sql.Int, parseInt(req.params.diagnosisid))
            .execute('viewDiagnosisDetails');
        await pool.close();
        res.json({
            success: true,
            diagnosisInfo: result.recordsets[0],
            linkedSessions: result.recordsets[1],
            linkedSuggestions: result.recordsets[2]
        });
    }
    catch (err) {
        res.json({ success: false, message: err.message });
    }
});

// D3. EDIT DIAGNOSIS
app.put('/editdiagnosis/:diagnosisid', async function (req, res) {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request()
            .input('DiagnosisID', sql.Int, parseInt(req.params.diagnosisid))
            .input('Name', sql.VarChar(100), req.body.name || null)
            .execute('editDiagnosis');
        await pool.close();
        res.json({ success: true, data: result.recordset });
    }
    catch (err) {
        res.json({ success: false, message: err.message });
    }
});

// D4. DELETE DIAGNOSIS
app.delete('/deletediagnosis/:diagnosisid', async function (req, res) {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request()
            .input('DiagnosisID', sql.Int, parseInt(req.params.diagnosisid))
            .execute('deleteDiagnosis');
        await pool.close();
        res.json({ success: true, data: result.recordset });
    }
    catch (err) {
        res.json({ success: false, message: err.message });
    }
});



app.get('/getSymptoms', async (req, res) => {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request()
            .query('SELECT SymptomID, Name FROM Symptom ORDER BY SymptomID');
        await pool.close();
        console.log('getSymptoms returned:', result.recordset.length, 'rows');
        res.json({ data: result.recordset });
    } catch (err) {
        console.error('getSymptoms error:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});


app.get('/getDiagnoses', async (req, res) => {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request()
            .query('SELECT DiagnosisID, Name FROM Diagnosis ORDER BY DiagnosisID');
        await pool.close();
        console.log('getDiagnoses returned:', result.recordset.length, 'rows');
        res.json({ data: result.recordset });
    } catch (err) {
        console.error('getDiagnoses error:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});
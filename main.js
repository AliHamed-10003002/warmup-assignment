
//read text files
const fs = require('fs');

    //entry[0] -> DriverID
    //entry[1] -> DriverName
    //entry[2] -> Date
    //entry[3] -> StartTime
    //entry[4] -> EndTime
    //entry[5] -> ShiftDuration
    //entry[6] -> IdleTime
    //entry[7] -> ActiveTime
    //entry[8] -> MetQuota
    //entry[9] -> HasBonus
   
// ============================================================
// Function 1: getShiftDuration(startTime, endTime)
// startTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// endTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// Returns: string formatted as h:mm:ss
// ============================================================
function getShiftDuration(startTime, endTime) {
    // endTime-startTime
    const ETsplits = endTime.split(':');
    const STsplits = startTime.split(':');

    let startHours = parseInt(STsplits[0]);
    let startMin = parseInt(STsplits[1]);
    let startSec = parseInt(STsplits[2]);

    let endHours = parseInt(ETsplits[0]);
    let endMin = parseInt(ETsplits[1]);
    let endSec = parseInt(ETsplits[2]);

    //condition if end time is pm
    if(startTime.includes('pm') && startHours!=12)
        startHours+=12;

    if(endTime.includes('pm') && endHours != 12)
        endHours+=12;
    
    let startTotal = (startHours*3600) + (startMin*60) + startSec;
    let endTotal = (endHours*3600) + (endMin*60) + endSec;

    let x = endTotal - startTotal;

    let durationHours = Math.floor(x/3600);
    x %= 3600;
    let durationMin = Math.floor(x/60)
    let durationSec = x % 60

    return`${durationHours}:${String(durationMin).padStart(2,'0')}:${String(durationSec).padStart(2, 0)}`;
    
}

// ============================================================
// Function 2: getIdleTime(startTime, endTime)
// startTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// endTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// Returns: string formatted as h:mm:ss
// ============================================================
function getIdleTime(startTime, endTime) {

    const ETsplits = endTime.split(':');
    const STsplits = startTime.split(':');

    let startHours = parseInt(STsplits[0]);
    let startMin = parseInt(STsplits[1]);
    let startSec = parseInt(STsplits[2]);

    let endHours = parseInt(ETsplits[0]);
    let endMin = parseInt(ETsplits[1]);
    let endSec = parseInt(ETsplits[2]);

    //condition if end time is pm
    if(startTime.includes('pm') && startHours!=12)
        startHours+=12;

    if(endTime.includes('pm') && endHours != 12)
        endHours+=12;

    let startTotal = (startHours*3600) + (startMin*60) + startSec;
    let endTotal = (endHours*3600) + (endMin*60) + endSec;

    let DeliveryStart = 8 * 3600;
    let DeliveryEnd = 22 * 3600;

    let idleStart = Math.max(0, (DeliveryStart - startTotal));
    let idleEnd = Math.max(0, (endTotal - DeliveryEnd));
    let idleTotal = idleStart + idleEnd;

    let idleHours = Math.floor(idleTotal / 3600);
    idleTotal = idleTotal % 3600;
    let idleMin = Math.floor(idleTotal/60);
    let idleSec = idleTotal % 60;


    return`${idleHours}:${String(idleMin).padStart(2,'0')}:${String(idleSec).padStart(2,'0')}`;


}
    



// ============================================================
// Function 3: getActiveTime(shiftDuration, idleTime)
// shiftDuration: (typeof string) formatted as h:mm:ss
// idleTime: (typeof string) formatted as h:mm:ss
// Returns: string formatted as h:mm:ss
// ============================================================
function getActiveTime(shiftDuration, idleTime) {
    // shiftDuration - idleTime

    const ShiftDuration = shiftDuration.split(':');
    const IdleTime = idleTime.split(':');

    let shiftHours = parseInt(ShiftDuration[0]);
    let shiftMin = parseInt(ShiftDuration[1]);
    let shiftSec = parseInt(ShiftDuration[2]);

    let idleHours = parseInt(IdleTime[0]);
    let idleMin = parseInt(IdleTime[1]);
    let idleSec = parseInt(IdleTime[2]);

    let shiftTotal = (shiftHours * 3600) + (shiftMin * 60) + shiftSec;
    let idleTotal = (idleHours * 3600) + (idleMin * 60) + idleSec;

    let x = shiftTotal - idleTotal;
    let activeHours = Math.floor(x/3600);
    x %= 3600
    let activeMin = Math.floor(x/60);
    let activeSec = x%60;


    return `${activeHours}:${String(activeMin).padStart(2,'0')}:${String(activeSec).padStart(2,'0')}`;

}

// ============================================================
// Function 4: metQuota(date, activeTime)
// date: (typeof string) formatted as yyyy-mm-dd
// activeTime: (typeof string) formatted as h:mm:ss
// Returns: boolean
// ============================================================
function metQuota(date, activeTime) {
    const Date = date.split('-');
    const year = parseInt(Date[0]);
    const month = parseInt(Date[1]);
    const day = parseInt(Date[2]);

    const timeSplits = activeTime.split(':');
    const activeHours = parseInt(timeSplits[0]);
    const activeMin = parseInt(timeSplits[1]);
    const activeSec = parseInt(timeSplits[2]);
    const activeTotal = (activeHours * 3600) + (activeMin * 60) + activeSec;

    let quota;
    if(year === 2025 && month ===4 && day>=10 && day<=30) 
        quota = 6*3600;
    else 
        quota = 8*3600 + 24 * 60;

    if(activeTotal >=quota)
        return true;
    else
        return false;

}

// ============================================================
// Function 5: addShiftRecord(textFile, shiftObj)
// textFile: (typeof string) path to shifts text file
// shiftObj: (typeof object) has driverID, driverName, date, startTime, endTime
// Returns: object with 10 properties or empty object {}
// ============================================================
function addShiftRecord(textFile, shiftObj) {
    const FileContent = fs.readFileSync(textFile, 'utf8');
    const lines = FileContent.split('\n');

    //Checking for duplicates
    for(const line of lines){
        if(line.startsWith('DriverID')) 
            continue;

        const entries = line.split(',');
        if(entries[0] === shiftObj.driverID && entries[2] ===shiftObj.date)
            return {}; //return empty obbject

    }

    //create driver entry object
    const shiftDuration = getShiftDuration(shiftObj.startTime, shiftObj.endTime);
    const idleTime = getIdleTime(shiftObj.startTime, shiftObj.endTime);
    const activeTime = getActiveTime(shiftDuration, idleTime)
    const quota = metQuota(shiftObj.date, activeTime);

    const newEntry ={
        driverID: shiftObj.driverID,
        driverName: shiftObj.driverName,
        date: shiftObj.date,
        startTime: shiftObj.startTime,
        endTime: shiftObj.endTime,
        shiftDuration: shiftDuration,
        idleTime: idleTime,
        activeTime: activeTime,
        metQuota: quota,
        hasBonus:false
    };

    const newLine = `${newEntry.driverID},${newEntry.driverName},${newEntry.date},${newEntry.startTime},${newEntry.endTime},${newEntry.shiftDuration},${newEntry.idleTime},${newEntry.activeTime},${newEntry.metQuota},${newEntry.hasBonus}`;

    //insert line in file
    let x = -1;
    for(let i = 0; i < lines.length; i++){
        if(lines[i].startsWith('DriverID'))
            continue;

        const entries = lines[i].split(',');
        if(entries[0]===shiftObj.driverID)
            x = i;

    }
    if(x===-1)
        lines.push(newLine);
    else
        lines.splice(x+1, 0, newLine);

    fs.writeFileSync(textFile, lines.join('\n'), 'utf8');

    return newEntry;
}


// ============================================================
// Function 6: setBonus(textFile, driverID, date, newValue)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// date: (typeof string) formatted as yyyy-mm-dd
// newValue: (typeof boolean)
// Returns: nothing (void)
// ============================================================
function setBonus(textFile, driverID, date, newValue) {
    const fileContent = fs.readFileSync(textFile, 'utf8');
    const lines = fileContent.split('\n');

    for(let i = 0; i < lines.length; i++){
        let entries = lines[i].split(',');

        if(entries[0] === driverID && entries[2] === date){
            entries[9] = newValue;
            lines[i] = entries.join(',');
            break;
        }
    }

    fs.writeFileSync(textFile, lines.join('\n'), 'utf8');
    
}

// ============================================================
// Function 7: countBonusPerMonth(textFile, driverID, month)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// month: (typeof string) formatted as mm or m
// Returns: number (-1 if driverID not found)
// ============================================================
function countBonusPerMonth(textFile, driverID, month) {
    const fileContent = fs.readFileSync(textFile, 'utf8');
    const lines = fileContent.split('\n');

    let count = -1;

    for(const line of lines){
        if(line.startsWith('DriverID'))
            continue;

        let entries = line.split(',');
        if(entries[0] === driverID){
            if(count ===-1) count = 0;
            const Month = parseInt(entries[2].split('-')[1]);
            if(Month === parseInt(month) && entries[9].trim() ==='true') 
                count++;

        }
    }

    return count;
    

}

// ============================================================
// Function 8: getTotalActiveHoursPerMonth(textFile, driverID, month)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// month: (typeof number)
// Returns: string formatted as hhh:mm:ss
// ============================================================
function getTotalActiveHoursPerMonth(textFile, driverID, month) {
    const fileContent = fs.readFileSync(textFile, 'utf8');
    const lines = fileContent.split('\n');

    let TotalSec = 0;

    for(const line of lines){
        if(line.startsWith('DriverID')) continue;
        const entries = line.split(',');
        if(entries[0] === driverID){
            const Month = parseInt(entries[2].split('-')[1]);
            if(Month === month){
                const ATsplits = entries[7].split(':');
                TotalSec += parseInt(ATsplits[0])*3600 + parseInt(ATsplits[1])*60 + parseInt(ATsplits[2]);
            }
        }

    }

    let hours = Math.floor(TotalSec/3600);
    TotalSec %= 3600;
    let min = Math.floor(TotalSec/60);
    let sec = TotalSec % 60;

    return`${hours}:${String(min).padStart(2,'0')}:${String(sec).padStart(2,'0')}`

}

// ============================================================
// Function 9: getRequiredHoursPerMonth(textFile, rateFile, bonusCount, driverID, month)
// textFile: (typeof string) path to shifts text file
// rateFile: (typeof string) path to driver rates text file
// bonusCount: (typeof number) total bonuses for given driver per month
// driverID: (typeof string)
// month: (typeof number)
// Returns: string formatted as hhh:mm:ss
// ============================================================
function getRequiredHoursPerMonth(textFile, rateFile, bonusCount, driverID, month) {
    const fileContent = fs.readFileSync(textFile, 'utf8');
    const lines = fileContent.split('\n');
    const rateContent = fs.readFileSync(rateFile, 'utf8');
    const rateLines = rateContent.split('\n');

    let TotalRequired =0; 
    let dayOff=null;
    //find driver day off
    for(const line of rateLines){
        const splits = line.split(',');
        if(splits[0] === driverID){
            dayOff = splits[1];
            break;
        }
    }

    for(const line of lines){
        if(line.trim()==='') continue;
        if(line.startsWith('DriverID')) continue;
        const entries = line.split(',');
        const Month = parseInt(entries[2].split('-')[1]);
        if(entries[0] === driverID && Month === month ){
            const year = parseInt(entries[2].split('-')[0]);
            const day = entries[2].split('-')[2];
            if(year ===2025 && month === 4 && parseInt(day) >=10 && parseInt(day)<=30)
                TotalRequired += 6*3600;
            else
                TotalRequired += 8*3600 + 24*60;
        }

    }


    for(let i = 0; i < bonusCount; i++)
        TotalRequired -=2*3600; 


    let reqHours = Math.floor(TotalRequired/3600);
    TotalRequired%=3600;
    let reqMin = Math.floor(TotalRequired/60);
    let reqSec = TotalRequired %60;

    return`${reqHours}:${String(reqMin).padStart(2,'0')}:${String(reqSec).padStart(2,'0')}`;

    }



// ============================================================
// Function 10: getNetPay(driverID, actualHours, requiredHours, rateFile)
// driverID: (typeof string)
// actualHours: (typeof string) formatted as hhh:mm:ss
// requiredHours: (typeof string) formatted as hhh:mm:ss
// rateFile: (typeof string) path to driver rates text file
// Returns: integer (net pay)
// ============================================================
function getNetPay(driverID, actualHours, requiredHours, rateFile) {
    //returns netPay
   //deductionRatePerHour = ⌊basePay / 185⌋ (rounded down)
  //salaryDeduction = missingHours × deductionRatePerHour
 //netPay = basePay − salaryDeduction
   
    const rateContent = fs.readFileSync(rateFile, 'utf8');
    const rateLines = rateContent.split('\n');

    let basePay, tier;
    for (const line of rateLines){
        let rates = line.split(',');
        if(rates[0] === driverID){
            basePay = parseInt(rates[2]);
            tier = parseInt(rates[3]); 
            break;
        }
    }

    let AllowedMissingH;
    switch(tier){
        case 1: AllowedMissingH = 50; break;
        case 2: AllowedMissingH = 20; break;
        case 3: AllowedMissingH = 10; break;
        case 4: AllowedMissingH = 3; break;
        default:AllowedMissingH = 0;
    }

    let AHsplits = actualHours.split(':');
    let RHsplits = requiredHours.split(':');

    let actualTotal = parseInt(AHsplits[0])*3600 + parseInt(AHsplits[1])*60 + parseInt(AHsplits[2]);
    let requiredTotal = parseInt(RHsplits[0])*3600 + parseInt(RHsplits[1])*60 + parseInt(RHsplits[2]);

    if(actualTotal >= requiredTotal )
        return basePay;

    const missingHours = Math.max(0, (requiredTotal - actualTotal) /3600); 
    const TotalMissingHours = Math.floor(Math.max(0, missingHours - AllowedMissingH));

    const deductionRate = Math.floor(basePay / 185);
    const salaryDeduction = TotalMissingHours * deductionRate
    const netPay = basePay - salaryDeduction;


    return netPay;
    

    

}


module.exports = {
    getShiftDuration,
    getIdleTime,
    getActiveTime,
    metQuota,
    addShiftRecord,
    setBonus,
    countBonusPerMonth,
    getTotalActiveHoursPerMonth,
    getRequiredHoursPerMonth,
    getNetPay
};


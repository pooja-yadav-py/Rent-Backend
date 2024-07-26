const oneMinuteExpiry = async(otpTime) => {
    try {
        console.log("otptime=====",otpTime);
        const current_dateTime =  new Date();
        let differenceValue = (otpTime-current_dateTime.getTime())/1000;
        differenceValue /= 60;

        console.log("Expiry minutes:- ",Math.abs(differenceValue))

        if(Math.abs(differenceValue) > 1){
            return true;
        }
        return false;
    } catch (error) {
        console.log(error)
    }
}

const threeMinuteExpiry = async(otpTime) => {
    try {
        console.log("otptime=====",otpTime);
        const current_dateTime =  new Date();
        let differenceValue = (otpTime-current_dateTime.getTime())/1000;
        differenceValue /= 60;

        console.log("Expiry minutes:- ",Math.abs(differenceValue))

        if(Math.abs(differenceValue) > 3){
            return true;
        }
        return false;
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    oneMinuteExpiry,
    threeMinuteExpiry
}
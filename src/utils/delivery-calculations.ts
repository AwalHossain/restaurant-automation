

const distanceBasedFeeCalculation = (distanceKM: number, fee: number) => {
const  BASE_PREP_TIME = 15 // minutes
const  MIN_SPEED = 15 // km/h
const  MAX_SPEED = 30 // km/h

// convert speed to minutes per km
const maxTimePerKM = (60/MAX_SPEED);
const minTimePerKM = (60/MIN_SPEED);
return {
  minMinutes: BASE_PREP_TIME + (minTimePerKM * distanceKM),
  maxMinutes: BASE_PREP_TIME + (maxTimePerKM * distanceKM),
}
}

const zoneBasedFeeCalculation = (zone: string, fee: number) => {

}
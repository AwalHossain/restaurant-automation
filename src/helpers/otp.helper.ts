

export const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };
  
  export const sendSMS = async (phoneNumber: string, message: string) => {
    // Implement your SMS sending logic here
    // You can use services like Twilio, MessageBird, etc.
    console.log(`Sending SMS to ${phoneNumber}: ${message}`);
  };

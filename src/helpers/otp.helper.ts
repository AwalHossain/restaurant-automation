import axios from "axios";
import env from "../config";
import ApiError from "../errors/ApiError";

export const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };
  
  export const  sendSMS = async (phoneNumber: string, message: string) => {
    // Implement your SMS sending logic here
    // You can use services like Twilio, MessageBird, etc.
      const authorization = `Token ${env.AUTH_SMS_SERVICE_AUTH_TOKEN}`;
      const senderId = env.AUTH_SMS_SERVICE_SENDER_ID;
      const baseUrl = env.AUTH_SMS_SERVICE_BASE_URL;
    try {
      const response = await axios.post(`${baseUrl}/send-sms`, {
        "sender_id": senderId,
        "message": message,
        "receiver": phoneNumber,
        "remove_duplicate": false
      }, {
        headers: {
          Authorization: authorization
        },
      })
      console.log("check response", response.data, "status", response.status);

      if(response.status === 200){
        return response.data
      }
      throw new ApiError(400, "Failed to send SMS");
      
    } catch (error) {
      console.log(error);
      throw new ApiError(400, "Failed to send SMS");
    }

      
  };

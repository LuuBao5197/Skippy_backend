require('dotenv').config();
const twilio = require("twilio"); // Or, for ESM: import twilio from "twilio";
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid,authToken);
const createSMS = async (toNumber, accessCode) => {
  console.log("--------------------------------------------------");
  console.log("START SEND MESSAGE (MOCKING MODE)");
  console.log(`- To Number: ${toNumber}`);
  console.log(`- Access Code: ${accessCode}`);
  console.log(`- Content: This is access code of you: ${accessCode}`);
  
  if (true) { 
    console.log("=> Send success(Mocked Success)");
    console.log("--------------------------------------------------");
    // Trả về một đối tượng giả lập giống như Twilio trả về
    return Promise.resolve({
      body: `This is access code of you: ${accessCode}`,
      sid: `MOCK_SID_${Date.now()}` // Tạo một SID giả
    });
  }
  // const message = await client.messages.create({
  //   body: `This is access code of you: ${accessCode}`,
  //   from:  "+12537858574",
  //   to: toNumber //"+15558675310",
  // });
  // console.log(message.body);
}
module.exports = {createSMS};

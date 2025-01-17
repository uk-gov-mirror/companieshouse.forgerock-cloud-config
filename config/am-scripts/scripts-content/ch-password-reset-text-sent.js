/* 
  ** INPUT DATA
    * SHARED STATE:
      - 'oneTimePassword' : the OTP code to be sent via text
      - '_id': the user ID to be send the text to (only populated if registrationMFA = false)
      - 'objectAttributes.telephoneNumber': the user telephone number (entered in a previous screen)

    * TRANSIENT STATE
      - 'notificationId' : the notification ID returned by Notify if the call was successful in a previous step
      - 'otpError': an OTP validaton error from a previous attempt (optional)  

  ** OUTCOMES
    - True: message shown 
  
  ** CALLBACKS:
    - error: if no phone number was found in context
    - error: if there is an OTP error in context (i.e. a previous attempt to validate the OTP has failed)
    - success: if there are no errors, including the notificationID and the phoneNumber used
*/

var fr = JavaImporter(
    org.forgerock.openam.auth.node.api.Action,
    javax.security.auth.callback.TextOutputCallback,
    com.sun.identity.authentication.callbacks.HiddenValueCallback
)

function extractPhoneNumber(){
    var isRegistrationMFA = transientState.get("registrationMFA");
    var userId = sharedState.get("_id");
    if(isRegistrationMFA){
        return sharedState.get("objectAttributes").get("telephoneNumber");
    } else {
        try{
            if (idRepository.getAttribute(userId, "telephoneNumber").iterator().hasNext()) {
                return idRepository.getAttribute(userId, "telephoneNumber").iterator().next();
            } else {
                logger.error("Couldn't find telephoneNumber");
                return false;
            }
        }catch(e){
            logger.error("[SHOW PHONE NUMBER] Error retrieving telephoneNumber: "+ e);
            return false;
        }
    }
}

//main execution logic
var phoneNumber = extractPhoneNumber();
if(!phoneNumber){
    if (callbacks.isEmpty()) {
        action = fr.Action.send(
            new fr.HiddenValueCallback (
                "pagePropsJSON",
                JSON.stringify({ 'errors': [{ label: "No phone number could be found in context.", }]})
            ),
            new fr.TextOutputCallback(
                fr.TextOutputCallback.ERROR,
                "No phone number could be found in context."
            )
        ).build()    
    }
}
logger.error("[SHOW PHONE NUMBER] phoneNumber : " + phoneNumber);

var notificationId = transientState.get("notificationId");
var otpError = transientState.get("error");
logger.error("[SHOW PHONE NUMBER] Notification ID: " + notificationId);
logger.error("[SHOW PHONE NUMBER] Found OTP Error : " + otpError);

if(otpError){
    if (callbacks.isEmpty()) {
        action = fr.Action.send(
            new fr.HiddenValueCallback (
                "pagePropsJSON",
                JSON.stringify({ 'errors': [{ label: otpError, anchor: "IDToken3" }], "phoneNumber": phoneNumber })
            ),
            new fr.TextOutputCallback(
                fr.TextOutputCallback.ERROR,
                otpError
            )
        ).build()    
    }
} else if (callbacks.isEmpty()) {
    action = fr.Action.send(
        new fr.HiddenValueCallback (
            "pagePropsJSON",
            JSON.stringify({"phoneNumber": phoneNumber}) 
        ),
        new fr.HiddenValueCallback (
            "notificationId",
            notificationId
        )
    ).build()
} else {
    outcome = "True";
}
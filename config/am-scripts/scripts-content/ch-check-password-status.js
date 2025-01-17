/*
  ** INPUT DATA
    * SHARED STATE:
      - '_id' : the user ID we are checking the password status of.
                Password status is held on frIndexedString3 for users. Can be 'pending' or 'migrated' for CH migrated users, blank for users
                added to FIDC directly
  ** OUTCOMES
    - valid: password either set in FIDC directly, or already updated
    - update: password needs to be validated against hash then set as user's password
*/

var NodeOutcome = {
    VALID: "valid",
    UPDATE: "update"
}

// frIndexedString3
var PASSWORD_MIGRATED_FIELD = "fr-attr-istr3";

function checkPasswordStatus() {
    var userId = sharedState.get("_id");
    logger.error("[CHECK PASSWORD STATUS] Found userId: " + userId);

    if (idRepository.getAttribute(userId, PASSWORD_MIGRATED_FIELD).iterator().hasNext()) {
        var status = idRepository.getAttribute(userId, PASSWORD_MIGRATED_FIELD).iterator().next();
        logger.error("[CHECK PASSWORD STATUS] Found status: " + status);
        if (status == "migrated") {
            // Migrated user has already validated their password
            return NodeOutcome.VALID;
        } else {
            // Migrated user validation is pending
            return NodeOutcome.UPDATE;
        }
    } else {
        // Not a migrated user
        logger.error("[CHECK PASSWORD STATUS] " + PASSWORD_MIGRATED_FIELD + " not set");
        return NodeOutcome.VALID;
    }
}

outcome = checkPasswordStatus();

var gcm = require("../util/gcm")
var logger = require("log4js").getLogger()
var mongoMeetings = require("../util/mongo_meetings")
var mongoUsers = require("../util/mongo_users")

module.exports = function(req, res) {

  // Extract data from put
  var meetingId = req.param("meetingId")
  var userId = req.param("userId")
  var votes = req.body.ranked
  logger.info(votes)

  if (!meetingId || !userId || !votes) {
    logger.warn("Client supplied an illformatted PUT body. Sending 400.")
    res.status(400).send({"error":400, "message": "PUT body was not formatted correctly."})
    return
  }

  // Get the meeting object the user requested
  mongoMeetings.getMeeting(meetingId, onGetMeeting(res, meetingId, userId, votes))

}

var onGetMeeting = function(res, meetingId, userId, votes) {

  return function(err, result) {

    if (err) {
      logger.warn("Error getting meeting to update during user vote. Sending 500.")
      response.status(500).send({"error": 500, "message": "Internal server error"})
      return
    }

    // Verify that the user is a member of the meeting
    var members = result.members
    if (members.indexOf(userId) === -1) {
      logger.warn("The client is not authorized to vote on meeting " + meetingId + ", sending 401.")
      res.status(401).send("Unauthorized")
      return
    }

    // Get the top locations already voted on
    var topLocations = result.topLocations

    // Now run through it again for real
    var position = 0
    votes.forEach(function(yelpid) {
      var index = votes.indexOf(yelpid)
      var newVote = topLocations[yelpid] + (votes.length - index)
      topLocations[yelpid] = newVote
    })
    logger.info(topLocations)

    // Re-set this object in mongo
    // I feel like this entire function is a huge race condition...
    mongoMeetings.setTopLocations(result.meetingId, topLocations, onSetTopLocations(res, result, userId, topLocations))

  }

}

var onSetTopLocations = function(res, meeting, userId, topLocations) {

  return function(err, result) {

    if (err) {
      loggeer.error("Error setting top locations for meetings in mongo")
      res.status(500).send("internal thingy")
      return
    }

    // At this point we're going to assume there are only two users, this will be improved later
    // Calculate the current winner
    var max = -1
    var top = ""
    Object.keys(topLocations).forEach(function(yelpId) {
      if (topLocations[yelpId] > max) {
        max = topLocations[yelpId]
        top = yelpId
      }
    })

    // Set the top location
    mongoMeetings.setFinalLocation(meeting.meetingId, top, onFinalLocationSet(res, meeting, userId, topLocations, top))

  }

}

var onFinalLocationSet = function(res, meeting, userId, meetingVotes, top) {

  return function(err, result) {

    // Send gcm to members
    gcm.sendVotingFinished(meeting.members, top)

    res.status(202).send()

  }

}
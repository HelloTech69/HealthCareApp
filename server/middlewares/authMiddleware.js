const checkAuthentication = (req, res, next) => {
    // Check if the user is authenticated based on the session
    if (req.session.user) {
      // User is authenticated, call next to continue processing the request
      next();
    } else {
      // User is not authenticated, send a response with unauthorized status
      res.status(401).json({ authenticated: false });
    }
  };
  
module.exports = checkAuthentication;
  
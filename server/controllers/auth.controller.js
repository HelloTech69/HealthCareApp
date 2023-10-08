const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');
const User = require('../models/userModel');
const Profile = require('../models/profileModel');
const crypto = require("crypto");

const generateRandomPassword = () => {
    return crypto.randomBytes(32).toString('hex');
};

async function generateUniqueUsername(fullName) {
    const uniqueUsername = fullName.toLowerCase().replace(/ /g, '_');
    let counter = 1;
  
    while (true) {
      const foundUser = await User.findOne({ username: uniqueUsername });
      if (!foundUser) {
        return uniqueUsername;
      }
      uniqueUsername = `${username}_${counter}`;
      counter++;
    }
  }

async function authLogin(req, res, username, fullname, userEmail, profilePic) {
  const user = await User.findOne({
    email: userEmail
  });
  if (!user) {
    const randomPass = generateRandomPassword();
    const uniqueUsername = await generateUniqueUsername(username);
    const newUser = new User({
        username: uniqueUsername,
        fullName: fullname,
        email: userEmail,
        passwordHash: randomPass,
        isAdmin: false,
        isEmailVerified: true,
    });
    const userToSave = await newUser.save();

    const newProfile = new Profile({
        userId: userToSave._id,
        username: userToSave.username,
        fullName: userToSave.fullName,
        profilePicture: profilePic,
    });
    const profileToSave = await newProfile.save();

    req.session.user = userToSave._id
    req.session.cookie.expires = false;
    res.status(200).json({ message: 'Login successful' });
  } else {
    req.session.user = user._id
    req.session.cookie.expires = false;
    res.status(200).json({ message: 'Login successful' });
  }
}
  
const getGoogleUserData = async (access_token) => {
    const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    })
    const data = await response.data;
    return data;
};

const handleGoogleCallback = async (req, res) => {
  try {
    const oAuth2Client = new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        'postmessage',
    );
    const { tokens } = await oAuth2Client.getToken(req.body.code);
    await oAuth2Client.setCredentials(tokens);
    const userAuth = oAuth2Client.credentials;
    // const newAccessToken = await refreshAccessToken(userAuth.refresh_token);
    // data = await getUserData(newAccessToken);
    data = await getGoogleUserData(userAuth.access_token)
    authLogin(req, res, data.name, data.given_name, data.email, data.picture);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'OAuth callback failed' });
  }
};

const refreshAccessToken = async (refresh_token) => {
    try {
      const data = {
        grant_type: 'refresh_token',
        refresh_token: refresh_token,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
      };
  
      const response = await axios.post('https://oauth2.googleapis.com/token', data);
      const newAccessToken = response.data.access_token;
  
      return newAccessToken;
    } catch (error) {
      console.error(error);
      throw error; 
    }
  };

const getGithubUserData = async (access_token) => {
  const basicInfoResponse = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    if (!basicInfoResponse.data || basicInfoResponse.data.error) {
      return res.status(400).json({ error: 'Failed to fetch basic user information' });
    }

    const emailInfoResponse = await axios.get('https://api.github.com/user/emails', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    if (!emailInfoResponse.data || emailInfoResponse.data.error) {
      return res.status(400).json({ error: 'Failed to fetch email information' });
    }
    const combinedData = {
      basicInfo: basicInfoResponse.data,
      emailInfo: emailInfoResponse.data,
    };
    return combinedData;
};

const handleGithubCallback = async (req, res) => {
  const code = req.body.code;
  if (!code) {
    return res.status(400).json({ error: 'Missing code parameter' });
  }
  try {
    const response = await axios.post('https://github.com/login/oauth/access_token', null, {
      params: {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code: code,
      },
      headers: {
        Accept: 'application/json',
      },
    });

    const data = response.data;
    if (data.error) {
      res.status(400).json({ error: data.error_description });
    }
    const access_token = data.access_token;
    const combinedData = await getGithubUserData(access_token);

    const { login, avatar_url, name } = combinedData.basicInfo;
    const primaryEmail = combinedData.emailInfo.find((email) => email.primary)?.email;

    authLogin(req, res, login, name, primaryEmail, avatar_url);
  } catch (error) {
    console.error('GitHub OAuth callback error:', error);
    return res.status(500).json({ error: 'GitHub OAuth callback failed' });
  }
}

// Function to handle user login
const loginUser = async (req, res) => {
    const { usernameOrEmail, password, rememberMe} = req.body; 
    try {
        // Find user by username or email
        const user = await User.findOne({
            $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }]
        });

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Compare passwords
        const passwordMatch = await user.comparePassword(password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid password' });
        }
        
        // store user information in session, typically a user id
        req.session.user = user._id
        if (rememberMe) {
            // Set cookie to expire in 30 days
            req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
        } else {
            // Set cookie to expire at end of session
            req.session.cookie.expires = false;
        }

        res.status(200).json({ message: 'Login successful' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const logoutUser = async (req, res) => {
    try {
        req.session.destroy(function (err) {
          if (err) {
            console.log('Error destroying session:', err);
          }
          res.clearCookie('sid', {expires: new Date(1), path:'/'});
          res.status(200).json({ message: 'Logout successful' });
        });
      } catch (error) {
        res.status(500).json({ message: 'Error logging out' });
      }
};

module.exports = {
    handleGoogleCallback,
    handleGithubCallback,
    loginUser,
    logoutUser,
};
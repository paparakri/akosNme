const axios = require('axios');
const NormalUser = require("../models/normalUser.js");

const getUserRecs = async (req, res) => {
  try {
    const normalUser = await NormalUser.findOne({username: req.params.id});
    const response = await axios.post('http://127.0.0.1:5000/recommendations', {"user_id": normalUser._id});
    const recommendations = response.data;
    res.status(200).json(recommendations);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
}

module.exports = { getUserRecs };
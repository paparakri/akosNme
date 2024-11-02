const axios = require('axios');
const NormalUser = require("../models/normalUser.js");
const reverseGeocode = require("./geocode.js");

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

const getUserList = async (req, res) => {
  try{
    const category = req.params.category;
    const response = await axios.get(`http://127.0.0.1:5000/api/clubs/${category}`);
    res.status(200).json(response.data);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
}

module.exports = { getUserRecs, getUserList };
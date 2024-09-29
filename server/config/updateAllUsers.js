const ClubUser = require("../models/clubUser.js");
const NormalUser = require("../models/normalUser.js");

const updateAllClubs = (req, res) => {
    ClubUser.updateMany(
        {}, // No filter, so it affects all documents
        { $set: { formattedPrice: 20 } } // Set the new field to the default value
      )
      .then(() => {
        console.log('All documents updated');
        res.status(200).json({message: "Added documents."});
      })
      .catch(err => {
        console.error('Error updating documents:', err);
      });
}

const updateAllNormalUsers = (req, res) => {
    NormalUser.updateMany(
        {}, // No filter, so it affects all documents
        { $set: { isActive: true } } // Set the new field to the default value
      )
      .then(() => {
        console.log('All documents updated');
        res.status(200).json({message: "Added documents."});
      })
      .catch(err => {
        console.error('Error updating documents:', err);
      });
}

module.exports = { updateAllClubs, updateAllNormalUsers };
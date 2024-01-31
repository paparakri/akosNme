import jsonwebtoken from "jsonwebtoken";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import NormalUser from "../models/normalUser.js";

/* REGISTERING NORMAL USER*/
export const register = async (req, res) => {
    try{
        const {
            username,
            firstName,
            lastName,
            email,
            password,
            picturePath,
            serviceProviderInterests,
            clubInterests,
            yourReviews
        } = req.body;

        const salt = await bcrypt.genSalt();
        const passHash = await bcrypt.hash(password, salt);

        const newNormalUser = new NormalUser({
            username,
            firstName,
            lastName,
            email,
            passHash,
            picturePath,
            serviceProviderInterests,
            clubInterests,
            yourReviews
        });
        const savedNormalUser = await newNormalUser.save();
        res.status(201).json(savedNormalUser);
    } catch(err){
        res.status(500).json({ error: err.message });
    }
}

/* LOGGING IN FOR NORMAL USER*/ /* THIS IS NOT SECURE. DIFFERENT AUTHENTICATION NEEDED. POSSIBLY FROM THIRD-PARTY. */
export const login = async (req, res) => {
    try{
        const { email, password } = req.body;
        const normalUser = await NormalUser.findOne({ email: email });
        if(!normalUser) return res.status(400).json ({ msg: "No user associated with that e-mail." });

        const isMatch = await bcrypt.compare(password, normalUser.passHash);
        if(!isMatch) return res.status(400).json({ msg: "Wrong password." });

        const token = jwt.sign({ id: normalUser._id }, process.env.JWT_SECRET);
        delete normalUser.password;
        res.status(200).json({ token, normalUser });
    }catch(err){
        res.status(500).json({ error: err.message });
    }
}
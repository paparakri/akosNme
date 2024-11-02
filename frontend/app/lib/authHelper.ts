"use client"
import axios from "axios";
import { headers } from "next/headers";

export const signInClubUser = async (data: any) => {
    try{
        const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        };

        console.log('Sending request to create club user');
        const res = await axios.post("http://127.0.0.1:3500/club", data, config);
        console.log('Club user created');
        localStorage.setItem('userToken', res.data.token);
        localStorage.setItem('userType', res.data.userType);
        console.log('Club user info stored in local storage');
    } catch (e) {
        console.error(e);
    }
}

export const loginClubUser = async (data: any) => {
    try {
        const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        };
        const res = await axios.post("http://127.0.0.1:3500/ClubLogin", data, config);

        localStorage.setItem('userToken', res.data.token);
        localStorage.setItem('userType', res.data.userType);

        console.log('token saved in localStorage because of logging in');
    } catch (error) {
        console.error("Error submitting form:", error);
    }  
}

export const signInNormalUser = async (data: any) => {
    try {
        const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        };
        const res = await axios.post("http://127.0.0.1:3500/UserRegister", data, config);

        localStorage.setItem('userToken', res.data.token);
        localStorage.setItem('userType', res.data.userType);
    } catch (error) {
        console.error("Error submitting form:", error);
    }
}

export const loginNormalUser = async (data: any) => {
    try {
        const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        };
        const res = await axios.post("http://127.0.0.1:3500/UserLogin", data, config);

        localStorage.setItem('userToken', res.data.token);
        localStorage.setItem('userType', res.data.userType);

        console.log('token saved in localStorage because of logging in');
        return res;
    } catch (error) {
        console.error("Error submitting form:", error);
        return error;
    }
}

export const logout = () => {
    try{
        localStorage.removeItem('userToken');
        localStorage.removeItem('userType');
    } catch (error){
        console.error(error);
    }
}
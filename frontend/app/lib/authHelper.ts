"use client"

import axios from "axios";
import Cookies from "js-cookie";
import { notifyAuthStateChange } from "./userStatus";

export const signInClubUser = async (data: any) => {
    try {
        const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        };
        console.log('Sending request to create club user');
        const res = await axios.post("http://127.0.0.1:3500/club", data, config);
        console.log('Club user created');
        
        // Set in localStorage
        localStorage.setItem('userToken', res.data.token);
        localStorage.setItem('userType', res.data.userType);
        
        // Set in cookies
        Cookies.set('userToken', res.data.token, { 
            expires: 7,
            path: '/',
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production'
        });
        Cookies.set('userType', res.data.userType, {
            expires: 7,
            path: '/',
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production'
        });
        
        console.log('Club user info stored in local storage and cookies');
        notifyAuthStateChange();
        return res.data;
    } catch (e) {
        console.error(e);
        throw e;
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
        
        // Set in localStorage
        localStorage.setItem('userToken', res.data.token);
        localStorage.setItem('userType', res.data.userType);
        
        // Set in cookies
        Cookies.set('userToken', res.data.token, { 
            expires: 7,
            path: '/',
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production'
        });
        Cookies.set('userType', res.data.userType, {
            expires: 7,
            path: '/',
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production'
        });
        
        console.log('Auth data saved in localStorage and cookies');
        notifyAuthStateChange();
        return res.data;
    } catch (error) {
        console.error("Error submitting form:", error);
        throw error;
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
        
        // Set in localStorage
        localStorage.setItem('userToken', res.data.token);
        localStorage.setItem('userType', res.data.userType);
        
        // Set in cookies
        Cookies.set('userToken', res.data.token, { 
            expires: 7,
            path: '/',
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production'
        });
        Cookies.set('userType', res.data.userType, {
            expires: 7,
            path: '/',
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production'
        });
        
        notifyAuthStateChange();

        return res.data;
    } catch (error) {
        console.error("Error submitting form:", error);
        throw error;
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
        
        // Set in localStorage
        localStorage.setItem('userToken', res.data.token);
        localStorage.setItem('userType', res.data.userType);
        
        // Set in cookies
        Cookies.set('userToken', res.data.token, { 
            expires: 7,
            path: '/',
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production'
        });
        Cookies.set('userType', res.data.userType, {
            expires: 7,
            path: '/',
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production'
        });
        
        console.log('Auth data saved in localStorage and cookies');
        notifyAuthStateChange();
        return res.data;
    } catch (error) {
        console.error("Error submitting form:", error);
        throw error;
    }
}

export const logout = () => {
    try {
        // Clear localStorage
        localStorage.removeItem('userToken');
        localStorage.removeItem('userType');
        
        // Clear cookies
        Cookies.remove('userToken', { path: '/' });
        Cookies.remove('userType', { path: '/' });
        notifyAuthStateChange();
    } catch (error) {
        console.error("Error during logout:", error);
        throw error;
    }
}
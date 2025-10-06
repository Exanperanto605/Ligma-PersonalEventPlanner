import React, { useEffect, useState } from "react";
import { UserAuth } from "../UserAuthContext";
import { redirect, RedirectType } from 'next/navigation'

const page = () => {
    const { user, loginWithGoogle } = UserAuth();
    const [loading, setLoading] = useState(true);

    const handleSignIn = async () => {
        try {
            const result = await loginWithGoogle();
            const userInf = result.user;
            console.log(`${userInf.displayName} has signed into the system.`);
            alert(`Welcome ${userInf.displayName}`);   // Placeholder; Remove it after everything is in order.
        } catch (error) {
            console.error(`Sign-in error: ${error}`);
            redirect('/placeholder401Page', RedirectType.replace); // Redirect to 401
                                                                   // -> change `placeholder401Page` to the dedicated 401 page
            // alert(error.message);   // Placeholder
        }
    }

    useEffect(() => {
        const checkAuth = async () => {
            await new Promise((resolve) => setTimeout(resolve, 50));
            setLoading(false);
        }

        checkAuth()
    }, [user])

    return (
        <div className='test-auth-container'>
            <button className="cursor-pointer" onClick={ handleSignIn }>Login with Google</button>
        </div>
    );
};

export default page

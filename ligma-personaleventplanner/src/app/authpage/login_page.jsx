import React from "react";
import { UserAuth } from "../UserAuthContext";

const page = () => {
    const { loginWithGoogle } = UserAuth();

    const handleSignIn = async () => {
        try {
            const result = await loginWithGoogle();
            const user = result.user;
            alert(`Welcome ${user.displayName}`);   // Placeholder
        } catch (error) {
            alert(error.message);   // Placeholder -> Redirect to 401
        }
    }

    return (
        <div className='test-auth-container'>
            <button className="cursor-pointer" onClick={ handleSignIn }>Login with Google</button>
        </div>
    );
};

export default page

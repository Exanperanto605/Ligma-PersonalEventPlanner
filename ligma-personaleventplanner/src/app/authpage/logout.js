import logout from "../UserAuthContext";

export const handleLogOut = async () => {
    try {
        await logout();
        console.log("A user has signed out.");
    }
    catch (error) {
        console.error(`Sign-out error: ${error}`);
    }
};

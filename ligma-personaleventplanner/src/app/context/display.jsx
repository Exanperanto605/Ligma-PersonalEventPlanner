import { UserAuthContext } from './auth-context';

export function displayUserInfo() {
    const currUser = useContext(UserAuthContext);

    useEffect(() => {
        const userId = currUser?.uid;
        const userName = currUser?.displayName;
        const userEmail = currUser?.email;
        const userPFP = currUser?.photoURL;

        console.log(`User ID: ${userId}`);
        console.log(`User Photo: ${userPFP}`);
        console.log(`Display Name: ${userName}`);
        console.log(`Email: ${userEmail}`);

        document.getElementById("userName").textContent = userName;
        document.getElementById("userProfilePicture").src = userPFP;
        document.getElementById("userEmail").textContent = userEmail;
    }, [currUser]);
    
    return null;
}

import { useContext, useState } from "react";
import { UserAuthContext } from "../../context/auth-context";
import { db } from "../../context/firebaseConfig";
import { useRouter } from "next/navigation";

function CreateNewAccount() {
    const { signUpWithEmailPW } = useContext(UserAuthContext);
    const router = useRouter();
    
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    // Date Picker Thing
    
}

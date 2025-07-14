"use client";

import { useLogin, useUser } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";

export default function PrivyLoginButton() {
    const router = useRouter();
    const { user } = useUser();
    const { login } = useLogin({
        onComplete: () => router.push("/"),
    });

    const handleLogin = () => {
        if (user) {
            console.log("user already logged in:", user);
            router.push("/");
        } else {
            console.log("user not logged in yet:", user);
            login();
        }
    };

    return (
        <button
            onClick={handleLogin}
            className="bg-violet-600 hover:bg-violet-700 py-3 px-6 text-white rounded-lg"
        >
            {user ? "Go to Dashboard" : "Log in"}
        </button>
    );
}

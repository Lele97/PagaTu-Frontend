import {useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import LoginForm from './login-form.jsx';
import styles from '~/styles/auth.module.css';

export default function LoginPage() {
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user is already logged in
        const authToken = localStorage.getItem('authToken');
        const pendingInvitation = localStorage.getItem('pendingInvitation');

        if (authToken) {
            // If there's a pending invitation, redirect to invitation handler
            if (pendingInvitation) {
                try {
                    const {username, groupName} = JSON.parse(pendingInvitation);
                    navigate(`/invitation?username=${encodeURIComponent(username)}&groupName=${encodeURIComponent(groupName)}`);
                } catch (error) {
                    console.error('Error parsing pending invitation:', error);
                    localStorage.removeItem('pendingInvitation');
                    navigate('/home');
                }
            } else {
                navigate('/home');
            }
        }
    }, [navigate]);

    return (
        <div>
            <LoginForm/>
        </div>
    );
}
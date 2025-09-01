import {useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import LoginForm from './login-form.jsx';

export default function LoginPage() {
    const navigate = useNavigate();

    useEffect(() => {
        const authToken = localStorage.getItem('authToken');
        const pendingInvitation = localStorage.getItem('pendingInvitation');

        if (authToken) {
            if (pendingInvitation) {
                try {
                    const {username, groupName} = JSON.parse(pendingInvitation);
                    navigate(`/invitation?username=${encodeURIComponent(username)}&groupName=${encodeURIComponent(groupName)}`);
                } catch (error) {
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
export const WELCOME_PATH = '/welcome';
export const HOME_PATH = '/home';

export const authRedirect = (navigate) => navigate(WELCOME_PATH, { replace: true });
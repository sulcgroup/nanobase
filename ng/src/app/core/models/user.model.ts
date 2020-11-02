export interface User {
    firstName: string;
    lastName: string;
    institution: string;
    email: string;
}

export interface UserRegistration {
    firstName: string;
    lastName: string;
    institution: string;
    email: string;
    password: string;
    confirmPassword: string;
}

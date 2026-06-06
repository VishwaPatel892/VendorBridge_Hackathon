interface RegisterParams {
    name: string;
    email: string;
    password: string;
    role: string;
    companyName?: string;
    contactName?: string;
    phone?: string;
    gstNo?: string;
    address?: any;
}
interface LoginResult {
    user: {
        _id: string;
        name: string;
        email: string;
        role: string;
        token: string;
        vendorId?: string;
    };
    accessToken: string;
    refreshToken: string;
}
declare const _default: {
    register: (params: RegisterParams) => Promise<LoginResult>;
    login: (email: string, role: string) => Promise<LoginResult>;
    refreshToken: (token: string) => Promise<{
        accessToken: string;
    }>;
    forgotPassword: (email: string) => Promise<void>;
    resetPassword: (token: string, newPassword: string) => Promise<void>;
};
export default _default;
//# sourceMappingURL=auth.service.d.ts.map
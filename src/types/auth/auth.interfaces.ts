export interface ForgotPasswordForm {
    email: string
    code?: string
    newPassword?: string
    confirmPassword?: string
}

export type StepType = 'with-otp' | 'recovery'

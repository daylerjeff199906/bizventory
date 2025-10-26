export const URL_CONFIG = {
  HOME: '/',
  NOT_AUTHORIZED: '/not-authorized',
  ONBOARDING: '/onboarding',
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
    SIGN_UP: '/sign-up'
  },
  CHAT: {
    ROOT: '/chat',
    CHAT_ID: (chatId: string) => `/chat/${chatId}`
  },
  STUDEY_GUIDES: {
    ROOT: '/study-guides',
    GUIDE_ID: (guideId: string) => `/study-guides/${guideId}`
  },
  SKILL_ASSESSMENT: {
    ROOT: '/skill-assessment',
    ASSESSMENT_ID: (assessmentId: string) => `/skill-assessment/${assessmentId}`
  },
  QUESTIONS_TREINING: {
    ROOT: '/questions-training',
    TRAINING_ID: (trainingId: string) => `/questions-training/${trainingId}`
  },
  STADISTICS: '/statistics',
  SETTINGS: '/settings',
  PROFILE: '/profile',
  PLANS: '/plans',
  ADMIN: {
    DASHBOARD: '/dashboard',
    ASSISTANTS: {
      ROOT: '/dashboard/assistants',
      ASSISTANT_ID: (assistantId: string) =>
        `/dashboard/assistants/${assistantId}`,
      CREATE: '/dashboard/assistants/create',
      EDIT: (assistantId: string) => `/dashboard/assistants/${assistantId}`
    },
    USERS: '/dashboard/users',
    USER_ID: (userId: string) => `/dashboard/users/${userId}`,
    CONTENT: '/dashboard/content',
    REPORTS: '/dashboard/reports'
  },
  NOT_FOUND: '/404'
}

export const appConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME || '任务管理平台',

  board: {
    defaultDaysToShow: 7,
    maxTasksPerDay: 50,
    weekStartsOn: 1 as const, // Monday
  },

  report: {
    maxWeeksBack: 12,
  },

  ai: {
    maxTokens: 2000,
    temperature: 0.7,
    timeout: 30000,
    retries: 3,
  },

  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100,
  },
}


export const config = {
    apiBaseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
    apiWsURL: import.meta.env.VITE_WS_URL || 'ws://localhost:5000/ws',
    apiBotHolidaysURL: import.meta.env.VITE_API_BOT_HOLIDAY_URL || "",
    apiBotToken: import.meta.env.VITE_API_BOT_TOKEN || "",
}
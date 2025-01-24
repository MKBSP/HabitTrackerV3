
export const formatDateForDB = (date: Date) => date.toISOString().split('T')[0];
export const formatDateForStore = (date: Date) => date.toISOString();
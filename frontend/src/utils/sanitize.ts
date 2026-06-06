import DOMPurify from 'dompurify';

export const sanitizeInput = (value: string): string => DOMPurify.sanitize(value.trim());

export const sanitizeEmail = (value: string): string => DOMPurify.sanitize(value.trim()).toLowerCase();

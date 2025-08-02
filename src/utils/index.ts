import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function calculateTimeUntilExpiry(expiryDate: string): {
  days: number;
  hours: number;
  isExpired: boolean;
  isExpiringSoon: boolean;
} {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diff = expiry.getTime() - now.getTime();

  if (diff <= 0) {
    return { days: 0, hours: 0, isExpired: true, isExpiringSoon: false };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  return {
    days,
    hours,
    isExpired: false,
    isExpiringSoon: days <= 2,
  };
}

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function formatWeight(weight: number, unit: string): string {
  if (unit === 'g' && weight >= 1000) {
    return `${(weight / 1000).toFixed(1)} kg`;
  }
  if (unit === 'ml' && weight >= 1000) {
    return `${(weight / 1000).toFixed(1)} l`;
  }
  return `${weight} ${unit}`;
}

export function calculateSustainabilityScore(item: {
  originalPrice: number;
  discountedPrice?: number;
  category: string;
  expiryDate: string;
}): number {
  let score = 50; // Base score

  // Price reduction impact (0-25 points)
  if (item.discountedPrice) {
    const discount = (item.originalPrice - item.discountedPrice) / item.originalPrice;
    score += discount * 25;
  }

  // Category impact (0-15 points)
  const categoryScores: Record<string, number> = {
    meat: 15,
    dairy: 12,
    fruits: 8,
    vegetables: 10,
    grains: 6,
    prepared: 14,
  };
  score += categoryScores[item.category] || 5;

  // Time sensitivity (0-10 points)
  const timeUntilExpiry = calculateTimeUntilExpiry(item.expiryDate);
  if (timeUntilExpiry.isExpiringSoon) {
    score += 10;
  } else if (timeUntilExpiry.days <= 7) {
    score += 5;
  }

  return Math.min(Math.round(score), 100);
}

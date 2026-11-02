import { FloodReport } from '@/types';

// In-memory state for user crowdsourced reports (starts empty for manual input)
export let IN_MEMORY_REPORTS: FloodReport[] = [];

export function getInMemoryReports(): FloodReport[] {
  return IN_MEMORY_REPORTS;
}

export function addInMemoryReport(report: FloodReport): void {
  IN_MEMORY_REPORTS = [report, ...IN_MEMORY_REPORTS];
}

export function deleteReportById(id: string): boolean {
  const initialLength = IN_MEMORY_REPORTS.length;
  IN_MEMORY_REPORTS = IN_MEMORY_REPORTS.filter((r) => r.id !== id);
  return IN_MEMORY_REPORTS.length < initialLength;
}

export function toggleReportVerification(id: string): boolean {
  const rep = IN_MEMORY_REPORTS.find((r) => r.id === id);
  if (rep) {
    rep.isAiVerified = !rep.isAiVerified;
    return true;
  }
  return false;
}

export function isReportFromToday(dateValue: string | Date | number | undefined): boolean {
  if (!dateValue) return true;
  const d = new Date(dateValue);
  if (isNaN(d.getTime())) return true;
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export function formatAuthorName(name?: string): string {
  if (!name || !name.trim()) return 'Warga Anonim';
  return name
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}


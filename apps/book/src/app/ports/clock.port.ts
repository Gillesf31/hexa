// Port for obtaining the current date/time.
// This abstracts the system clock so the use-case remains pure and testable —
// in tests you inject a fake clock returning a fixed date.
export interface ClockPort {
  today(): string;
}

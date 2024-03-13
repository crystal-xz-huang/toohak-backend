declare module 'unix-timestamp' {
  export const Millisecond: number;
  export const Second: number;
  export const Minute: number;
  export const Hour: number;
  export const Day: number;
  export const Week: number;
  export const Month: number;
  export const Year: number;

  export function now(offset?: string | number): number;
  export function add(time: number, offset: string | number): number;
  export function duration(offset: string | number): number;
  export function fromDate(date: Date | string): number;
  export function toDate(time: number): Date;

  export let round: boolean;
}

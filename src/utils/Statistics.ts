import { Logger } from '@utils/utils';

export default class Statistics {
  turnsVisible: number;
  turnsTotal: number;
  scrollTop: number | null;
  clientHeight: number | null;
  scrollHeight: number | null;

  constructor() {
    this.turnsVisible = 0;
    this.turnsTotal = 0;
    this.scrollTop = null;
    this.clientHeight = null;
    this.scrollHeight = null;
  }

  update(obj: any) {
    Logger.debug('Statistics', 'Updating...');
    let updated = false;

    const keys: (keyof Statistics)[] = Object.keys(this) as (keyof Statistics)[];
    for (const key of keys) {
      if (key in obj && this[key] !== obj[key]) {
        Logger.debug('Statistics', `${key} = ${obj[key]}`);
        this[key] = obj[key];
        updated = true;
      }
    }
    
    if (!updated) Logger.debug("Statistics", "No changes made.");
  }

  #format(val: any): string {
    if (typeof val === 'number') return val.toFixed(0);
    if (val === null) return 'null';
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
  }

  toString() {
    const output: string[] = [`Messages: ${this.turnsVisible} / ${this.turnsTotal}`];

    const keys: (keyof Statistics)[] = Object.keys(this) as (keyof Statistics)[]    ;
    for (const key of keys) {
      const val: any = this[key];
      const formatted: string = this.#format(val);
      output.push(`${key}: ${formatted}`);
    }

    return output.join('\n');
  }
}

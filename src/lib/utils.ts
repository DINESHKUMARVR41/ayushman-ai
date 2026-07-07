/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Cleanly merges dynamic tailwind styles.
 */
export function cn(...inputs: (string | undefined | null | false | {[key: string]: boolean})[]) {
  const classes: string[] = [];
  for (const input of inputs) {
    if (!input) continue;
    if (typeof input === 'string') {
      classes.push(input);
    } else if (typeof input === 'object') {
      for (const [key, value] of Object.entries(input)) {
        if (value) {
          classes.push(key);
        }
      }
    }
  }
  return classes.join(' ');
}

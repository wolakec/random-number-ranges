#!/usr/bin/env node

// Written by Wol Akec 
const readline = require('readline');

const MAX_VALUE = 1000000000;
const RANGES_TO_GENERATE = 1000000;
const KEY_QUIT = 'q';

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

const getNoOfRanges = (args) => {
  const rangesArg = args.findIndex((element) => {
    return element === '--ranges';
  });

  // We return a default value
  if (rangesArg === -1) {
    return RANGES_TO_GENERATE;
  }

  // Argument value should be next in array
  let n = parseInt(args[rangesArg + 1]);

  if (!Number.isInteger(n)) {
    throw new Error(
      "--ranges argument must be a positive integer e.g: --ranges 100"
    );
  }

  if (n < 1) {
    throw new Error("--ranges argument must be greater than 0");
  }

  // Added a maximum number of ranges
  if (n > MAX_VALUE) {
    throw new Error(`maximum number of ranges is: ${MAX_VALUE}`);
  }

  return n;
}

const generateRandomNumber = (max) => {
  // An example of the type of checks we can use
  // JsDoc is useful in some regards, to help document
  // the function signature and return type.
  // You could also go lang...
  if (!Number.isInteger(max)) {
    throw new Error("argument 'max' must be an integer");
  }

  return Math.floor(Math.random() * max);
}

const generateRange = (maxValue) => {
  if (!Number.isInteger(maxValue)) {
    throw new Error("argument 'maxValue' must be an integer");
  }

  let min = generateRandomNumber(maxValue);
  let max = generateRandomNumber(maxValue);

  if (min === max) {
    return generateRange(maxValue);
  }

  if (max < min) {
    const temp = max;
    max = min;
    min = temp;
  }

  return {
    min: min,
    max: max
  }
}

const generateRanges = (numberOfRanges, maxValue) => {
  const ranges = [];

  for (let i = 0; i < numberOfRanges; i++) {
    ranges[i] = generateRange(maxValue);
  }

  return ranges;
}

const sortByMinDesc = (ranges) => {
  return ranges.sort((a, b) => {
    return a.min - b.min
  });
}

const countOccurances = (number, ranges) => {
  let counter = 0;
  for (let i = 0; i < ranges.length; i ++) {
    // Range is sorted by minimum in ascending order
    // so if our number is too small for the current range
    // it will not appear in any larger ranges, so we quit here
    if (number < ranges[i].min) {
      break;
    }

    if (number < ranges[i].max) {
      counter++;
    }
  }

  return counter;
}

const main = (cb) => {

  let quit = false;
  process.stdin.on('keypress', (str, key) => {
    if (str === KEY_QUIT) {
      quit = true;
    }
  });

  const args = process.argv.slice(2);
  const n = getNoOfRanges(args);

  console.log(`Generating ${n} ranges`);

  // Sorting our ranges means we don't need to traverse
  // through all of them every time
  const ranges = sortByMinDesc(generateRanges(n, MAX_VALUE));

  // We want numbers to be generated infinitely but
  // without blocking I/O events
  const infiniteGeneration = () => {
    setImmediate(() => {
      if (quit == true) {
        cb();
      }

      let number = generateRandomNumber(MAX_VALUE);
      let count = countOccurances(number, ranges);

      console.log(`${number} => Enclosed by ${count} range(s)`);

      infiniteGeneration();
    });
  }

  infiniteGeneration();
}

try {
  // Callback provided to main will be invoked
  // after user presses 'q'. Any additional shutdown
  // functionality can go here
  main(() => {
    process.exit(0);
  });
} catch (err) {
  console.error(err);
  process.exit(1);
}

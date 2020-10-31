import fs from 'fs';
import path from 'path';
import { Parser as XMLParser } from 'xml2js';

const threshold = {
  statements: 80,
  branches: 80,
  functions: 80,
};

const newLine = '\n';

/**
 * Get flatened file details.
 */
const getFlatFiles = (coverage) => {
  const parentKey = ['project', 'package'].find((key) => key in coverage);

  if (parentKey) {
    return [].concat(...coverage[parentKey].map((item) => getFlatFiles(item)));
  }

  return coverage.file || [];
};

/**
 * Get the percentage covered for a given metric.
 */
const getCoveredPercentage = (covered, total) => {
  const percentage = ((covered / total) * 100);

  if (!Number(total)) {
    return 100;
  }

  if (Number.isNaN(percentage)) {
    return '-';
  }

  return Number(percentage.toFixed(2));
};

/**
 * Get the percentages for all metrics.
 */
const getMetricPercentages = ({
  statements,
  coveredstatements,
  conditionals,
  coveredconditionals,
  methods,
  coveredmethods,
}) => ({
  statements: getCoveredPercentage(coveredstatements, statements),
  branches: getCoveredPercentage(coveredconditionals, conditionals),
  functions: getCoveredPercentage(coveredmethods, methods),
});

/**
 * Shorten a path so that it fits in a GitHub comment.
 */
const getShortPath = (filePath) => {
  const maxChars = 50;
  const parts = filePath.split('/').reverse().filter((x) => x);

  if (parts.length === 1) {
    return filePath;
  }

  const shortParts = [];

  let currentChars = 0;

  parts.forEach((part) => {
    if (currentChars < maxChars) {
      shortParts.push(part);
      currentChars += part.length + 1; // +1 for the path seperator
    }
  });

  if (shortParts.length < parts.length - 1) {
    shortParts.push('..');
  }

  return shortParts.reverse().join('/');
};

/**
 * Check if we have passed the thresholds for the given percentages.
 */
const hasPassed = ({
  statements,
  branches,
  functions,
}) => (
  (Number(statements) >= threshold.statements || statements === '-')
  && (Number(branches) >= threshold.branches || branches === '-')
  && (Number(functions) >= threshold.functions || functions === '-')
);

/**
 * Build a row for the coverage table.
 */
const buildRow = (file) => {
  const { line = [], metrics } = file;
  const fileMetrics = (metrics?.[0].$ || {});

  const noLines = !line.length;

  const { sha } = danger.git?.commits?.[danger.git.commits.length - 1] || {};
  const filePath = path.relative(process.cwd(), file.$.path);
  const shortPath = getShortPath(filePath);
  const fileLink = `../blob/${sha}/${filePath}`;
  const fileCell = sha ? `[${shortPath}](${fileLink})` : shortPath;

  const percentages = getMetricPercentages(fileMetrics);
  const { statements, branches, functions } = percentages;

  let emoji = hasPassed(percentages) ? ':white_check_mark:' : ':x:';

  if (noLines) {
    emoji = '-';
  }

  return [
    '',
    fileCell,
    noLines ? '-' : statements,
    noLines ? '-' : branches,
    noLines ? '-' : functions,
    emoji,
    '',
  ].join('|');
};

/**
 * Join items in a table row.
 */
const joinRow = (items) => `|${items.map((item) => item).join('|')}|`;

/**
 * Build the coverage table.
 */
const buildTable = (files) => {
  const headings = [
    'Impacted Files',
    '% Stmts',
    '% Branch',
    '% Funcs',
    '',
  ];

  const headingRow = joinRow(headings);
  const emptyHeadingRow = joinRow(new Array(headings.length).fill(' '));
  const seperator = joinRow(
    new Array(headings.length).fill().reduce((acc, _, index) => [
      ...acc,
      index === 0 ? '---' : ':-:', // Center align all but the first column
    ], []),
  );

  const maxRows = 5;
  const allFileRows = files.map((file) => buildRow(file, threshold));
  const mainFileRows = allFileRows.slice(0, maxRows);
  const extraFileRows = allFileRows.slice(maxRows);

  let table = [
    headingRow,
    seperator,
    ...mainFileRows,
  ].join(newLine);

  if (extraFileRows.length) {
    table += [
      newLine,
      '<details>',
      '<summary>',
      `and ${extraFileRows.length} more...`,
      '</summary>',
      '',
      emptyHeadingRow,
      seperator,
      ...extraFileRows,
      '</details>',
    ].join(newLine);
  }

  return table;
};

/**
 * Get a line for the threshold summary.
 */
const getThresholdSummaryLine = (percentages, key) => {
  const wasMet = Number(percentages[key]) >= threshold[key];

  if (wasMet) {
    return '';
  }

  return `Coverage threshold for ${key} (${threshold[key]}%) not met: ${percentages[key]}%`;
};

/**
 * Build the test summary.
 */
const buildSummary = (metrics, successMessage, failureMessage) => {
  const percentages = getMetricPercentages(metrics);
  const passed = hasPassed(percentages);

  const thresholdSummary = [
    getThresholdSummaryLine(percentages, 'statements'),
    getThresholdSummaryLine(percentages, 'branches'),
    getThresholdSummaryLine(percentages, 'functions'),
  ].filter((x) => !!x); // Remove empty strings

  if (passed) {
    return `> ${successMessage}`;
  }

  return [
    `> ${failureMessage}`,
    ...(thresholdSummary.length ? [
      '',
      '```',
      ...thresholdSummary,
      '```',
    ] : []),
  ].join(newLine);
};

/**
 * Get the combined metrics for the checked files.
 */
const getCombinedMetrics = (files) => files.reduce((acc, file) => {
  const fileMetrics = (file.metrics?.[0].$ || {});

  Object.keys(fileMetrics).forEach((key) => {
    acc[key] = acc[key] || 0 + Number(fileMetrics[key]);
  });

  return acc;
}, {});

/**
 * Get the parsed coverage XML.
 */
const getCoverageXml = async (customPath) => {
  const relativePath = customPath || path.join('coverage', 'clover.xml');
  const absolutePath = path.join(process.cwd(), relativePath);
  const xmlParser = new XMLParser();

  if (!fs.existsSync(absolutePath)) {
    return null;
  }

  const data = fs.readFileSync(absolutePath);
  const { coverage: coverageXml } = await xmlParser.parseStringPromise(data);

  return coverageXml;
};

/**
 * Get the relevant files.
 */
const getRelevantFiles = (coverageXml) => {
  const files = getFlatFiles(coverageXml);
  const allFiles = [
    ...(danger.git?.created_files || []),
    ...(danger.git?.modified_files || []),
  ];

  return files.filter((file) => allFiles.includes(file.$.path));
};

/**
 * Report coverage.
 */
export const coverage = async ({
  successMessage = ':+1: Test coverage is looking good.',
  failureMessage = 'Test coverage is looking a little low for the files created '
    + 'or modified in this PR, perhaps we need to improve this.',
  cloverReportPath,
} = {}) => {
  const coverageXml = await getCoverageXml(cloverReportPath);

  if (!coverageXml) {
    return;
  }

  const relevantFiles = getRelevantFiles(coverageXml);

  const combinedMetrics = getCombinedMetrics(relevantFiles);
  const table = buildTable(relevantFiles);
  const summary = buildSummary(combinedMetrics, successMessage, failureMessage);
  const report = [
    '## Coverage Report',
    summary,
    table,
  ].join(newLine + newLine);

  markdown(report);
};

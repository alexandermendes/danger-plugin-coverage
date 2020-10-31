import path from 'path';
import mockFs from 'mock-fs';

import coverage from '../../src';
import {
  getFileXml,
  getMarkdownReport,
  setupEnv,
  wrapXmlReport,
} from '../utils';

const cloverPath = path.join(process.cwd(), 'coverage', 'clover.xml');

const defautMetrics = {
  statements: 10,
  coveredstatements: 10,
  conditionals: 10,
  coveredconditionals: 10,
  methods: 10,
  coveredmethods: 10,
};

const defaultLine = {
  num: 1,
  count: 1,
  type: 'stmt',
};

describe('Custom messages', () => {
  beforeEach(setupEnv);

  afterEach(() => {
    mockFs.restore();
  });

  it('reports with a custom success message', async () => {
    const file = getFileXml('src/one.js', defautMetrics, [defaultLine]);
    const xmlReport = wrapXmlReport(file);

    mockFs({
      [cloverPath]: xmlReport,
    });

    Object.assign(danger, {
      git: {
        created_files: ['src/one.js'],
        modified_files: [],
      },
    });

    await coverage({
      successMessage: 'All good',
    });

    const report = getMarkdownReport();
    const lines = report.split('\n');

    expect(lines).toContain('> All good');
  });

  it('reports with a custom failure message', async () => {
    const file = getFileXml('src/one.js', {
      statements: 10,
      coveredstatements: 0,
      conditionals: 10,
      coveredconditionals: 0,
      methods: 10,
      coveredmethods: 0,
    }, [defaultLine]);
    const xmlReport = wrapXmlReport(file);

    mockFs({
      [cloverPath]: xmlReport,
    });

    Object.assign(danger, {
      git: {
        created_files: ['src/one.js'],
        modified_files: [],
      },
    });

    await coverage({
      failureMessage: 'Not good',
    });

    const report = getMarkdownReport();
    const lines = report.split('\n');

    expect(lines).toContain('> Not good');
  });
});

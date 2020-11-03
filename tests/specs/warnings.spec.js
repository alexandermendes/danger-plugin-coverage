import mockFs from 'mock-fs';

import coverage from '../../src';
import { CLOVER_PATH, DEFAULT_METRICS, DEFAULT_LINE } from '../constants';
import {
  getFileXml,
  setupEnv,
  wrapXmlReport,
} from '../utils';

describe('Warnings', () => {
  beforeEach(setupEnv);

  afterEach(() => {
    mockFs.restore();
  });

  it('warns if no report detected', async () => {
    mockFs();

    Object.assign(danger, {
      git: {
        created_files: ['from-custom-report.js'],
        modified_files: [],
      },
    });

    await coverage();

    const [warning] = warn.mock.calls?.[0] || [];

    expect(warning).toMatch(/No coverage report.*/);
    expect(warning).toMatchSnapshot();
  });

  it('does not log any warnings on no report if disabled', async () => {
    mockFs();

    Object.assign(danger, {
      git: {
        created_files: ['from-custom-report.js'],
        modified_files: [],
      },
    });

    await coverage({ warnOnNoReport: false });

    const [warning] = warn.mock.calls?.[0] || [];

    expect(warning).toBeUndefined();
  });

  it('warns if files missing from report', async () => {
    const file = getFileXml('src/one.js', DEFAULT_METRICS, [DEFAULT_LINE]);
    const xmlReport = wrapXmlReport(file);

    mockFs({
      [CLOVER_PATH]: xmlReport,
    });

    Object.assign(danger, {
      git: {
        created_files: ['src/one.js', 'src/two.js'],
        modified_files: ['src/three.js'],
      },
    });

    await coverage();

    const [warning] = warn.mock.calls?.[0] || [];

    expect(warning).toMatch(/.*no data on 2 files.*/);
    expect(warning).toMatchSnapshot();
  });

  it('does not log any warnings on missing files if disabled', async () => {
    const file = getFileXml('src/one.js', DEFAULT_METRICS, [DEFAULT_LINE]);
    const xmlReport = wrapXmlReport(file);

    mockFs({
      [CLOVER_PATH]: xmlReport,
    });

    Object.assign(danger, {
      git: {
        created_files: ['src/one.js', 'src/two.js'],
        modified_files: ['src/three.js'],
      },
    });

    await coverage({ warnOnMissingFiles: false });

    const [warning] = warn.mock.calls?.[0] || [];

    expect(warning).toBeUndefined();
  });
});

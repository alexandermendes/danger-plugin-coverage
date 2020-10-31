const mockDangerGlobals = () => {
  global.fail = jest.fn();
  global.markdown = jest.fn();
  global.message = jest.fn();
  global.peril = jest.fn();
  global.schedule = jest.fn();
  global.warn = jest.fn();

  global.danger = {};
};

export const setupEnv = () => {
  mockDangerGlobals();
};

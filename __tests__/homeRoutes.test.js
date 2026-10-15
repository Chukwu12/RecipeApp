const mockRouter = {
  get: jest.fn(),
  post: jest.fn()
};

jest.mock('express', () => ({
  Router: () => mockRouter
}));

jest.mock('../controllers/auth', () => ({
  getLogin: jest.fn(),
  postLogin: jest.fn(),
  logout: jest.fn(),
  getSignup: jest.fn(),
  postSignup: jest.fn()
}));

jest.mock('../controllers/home', () => ({
  getIndex: jest.fn()
}));

jest.mock('../controllers/profile', () => ({}));
jest.mock('../controllers/main', () => ({}));
jest.mock('../middleware/auth', () => ({
  ensureAuth: jest.fn()
}));
jest.mock('../middleware/rateLimit', () => ({
  authLimiter: jest.fn(),
  readLimiter: jest.fn()
}));

const authController = require('../controllers/auth');

describe('home routes', () => {
  beforeAll(() => {
    require('../routes/home');
  });

  it('only exposes logout as a POST route', () => {
    expect(mockRouter.post).toHaveBeenCalledWith('/logout', authController.logout);
    expect(mockRouter.get.mock.calls.some(([path]) => path === '/logout')).toBe(false);
  });
});

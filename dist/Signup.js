'use strict';
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (
          !desc ||
          ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)
        ) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : function (o, v) {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (k !== 'default' && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const react_1 = __importStar(require('react'));
const react_router_dom_1 = require('react-router-dom');
const keyboardArrowRightIcon_svg_1 = require('../assets/svg/keyboardArrowRightIcon.svg');
const visibilityIcon_svg_1 = __importDefault(
  require('../assets/svg/visibilityIcon.svg'),
);
const Signup = () => {
  const [showPassword, setShowPassword] = (0, react_1.useState)(false);
  const [formData, setFormData] = (0, react_1.useState)({
    name: '',
    email: '',
    password: '',
  });
  const { name, email, password } = formData;
  const navigate = (0, react_router_dom_1.useNavigate)();
  const onChange = (e) => {
    setFormData((prevState) =>
      Object.assign(Object.assign({}, prevState), {
        [e.target.id]: e.target.value,
      }),
    );
  };
  return react_1.default.createElement(
    react_1.default.Fragment,
    null,
    react_1.default.createElement(
      'div',
      { className: 'pageContainer' },
      react_1.default.createElement(
        'header',
        null,
        react_1.default.createElement(
          'p',
          { className: 'pageHeader' },
          'Welcome Back!',
        ),
      ),
      react_1.default.createElement(
        'main',
        null,
        react_1.default.createElement(
          'form',
          null,
          react_1.default.createElement('input', {
            type: 'text',
            className: 'nameInput',
            placeholder: 'Name',
            id: 'name',
            value: name,
            onChange: onChange,
          }),
          react_1.default.createElement('input', {
            type: 'email',
            className: 'emailInput',
            placeholder: 'Email',
            id: 'email',
            value: email,
            onChange: onChange,
          }),
          react_1.default.createElement(
            'div',
            { className: 'passwordInputDiv' },
            react_1.default.createElement('input', {
              type: showPassword ? 'text' : 'password',
              className: 'passwordInput',
              placeholder: 'Password',
              id: 'password',
              value: password,
              onChange: onChange,
            }),
            react_1.default.createElement('img', {
              src: visibilityIcon_svg_1.default,
              alt: 'showPassword',
              className: 'showPassword',
              onClick: () => setShowPassword((prevState) => !prevState),
            }),
          ),
          react_1.default.createElement(
            react_router_dom_1.Link,
            { to: '/forgot-password', className: 'forgotPasswordLink' },
            'Forgot Password',
          ),
          react_1.default.createElement(
            'div',
            { className: 'signUpBar' },
            react_1.default.createElement(
              'p',
              { className: 'signUpText' },
              'Sign up',
            ),
            react_1.default.createElement(
              'button',
              { className: 'signUpButton' },
              react_1.default.createElement(
                keyboardArrowRightIcon_svg_1.ReactComponent,
                { fill: '#ffffff', width: '34px', height: '34px' },
              ),
            ),
          ),
        ),
        react_1.default.createElement(
          react_router_dom_1.Link,
          { to: '/signin', className: 'registerLink' },
          'Sign in',
        ),
      ),
    ),
  );
};
exports.default = Signup;

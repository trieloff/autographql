"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _http = _interopRequireDefault(require("http"));

var _utils = require("../utils");

var _gqlFunction = _interopRequireDefault(require("./gqlFunction"));

var _build = _interopRequireDefault(require("./build"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import authenticate from '@esmodule/jwt-verify'
class devServer {
  constructor(options) {
    const root = options.root,
          resolvers = options.resolvers,
          schema = options.schema,
          dev = options.dev,
          external = options.external,
          rollup = options.rollup;
    this.root = root;
    this.resolvers = resolvers;
    this.schema = schema;
    this.external = external;
    this.rollup = rollup;
    this.port = dev ? dev.port ? dev.port : 7000 : 7000;
    this.server = null;
  }

  buildFunction() {
    this.server = null;

    const _buildHttp = (0, _build.default)({
      root: this.root,
      schema: this.schema,
      resolvers: this.resolvers,
      external: this.external,
      rollup: this.rollup
    }),
          resolverLoc = _buildHttp.resolverLoc,
          schemaLoc = _buildHttp.schemaLoc;

    return {
      resolverLoc,
      schemaLoc
    };
  }

  createServer({
    resolverLoc,
    schemaLoc
  }) {
    this.server = _http.default.createServer((req, res) => {
      let reqData = '';

      if (req.method === 'POST') {
        req.on('data', chunk => {
          reqData += chunk;
        });
        req.on('error', error => (0, _utils.logger)('error', `http: ${error}`));
        req.on('end', async () => {
          /*
          if (req.headers.authorization) {
            console.time('auth')
            const authHeader = req.headers.authorization
            const token = authHeader.substr(7)
            const authResponse = await authenticate(token)
            logger(
              'info',
              `authResponse: ${JSON.stringify(authResponse, null, 2)}`
            )
            console.timeEnd('auth')
          }
          */
          const reqJSON = JSON.parse(reqData);
          const operationName = reqJSON.operationName || reqJSON.query;
          const response = await (0, _gqlFunction.default)(reqJSON, resolverLoc, schemaLoc);
          res.writeHead(200, {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          });
          res.write(response, 'utf8');
          res.end(() => {
            (0, _utils.logger)('info', `Response to: ${operationName}`);
          });
        });
      } else {
        if (req.method === 'OPTIONS') {
          res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '3600',
            Vary: 'Access-Control-Request-Headers'
          });
          res.end();
        } else {
          res.writeHead(405, {
            'Content-Type': 'text/html'
          });
          res.end('405 - Method not supported');
        }
      }
    });
    return true;
  }

  startServer() {
    this.server.listen(this.port);
    return true;
  }

  stopServer() {
    this.server.close();
    return true;
  }

  initServer() {
    if (this.createServer(this.buildFunction())) {
      return this.startServer();
    }
  }

}

var _default = devServer;
exports.default = _default;
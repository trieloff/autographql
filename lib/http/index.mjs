function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

import DevServer from './devServer';
import { logger } from '../utils';
import chokidar from 'chokidar';

const initHttpServer =
/*#__PURE__*/
function () {
  var _ref = _asyncToGenerator(function* (options) {
    try {
      const resolvers = options.resolvers,
            schema = options.schema;
      let newServer = new DevServer(options);

      if (newServer.initServer()) {
        const watcher = chokidar.watch([resolvers, schema]);
        watcher.on('ready', () => {
          watcher.on('change', () => {
            logger('info', "dev: Files changed, rebuilding function");

            if (newServer.stopServer()) {
              newServer.initServer();
            }
          });
        });
      }
    } catch (error) {
      logger('error', "Unable to init http server with error:\n " + error);
    }
  });

  return function initHttpServer(_x) {
    return _ref.apply(this, arguments);
  };
}();

export default initHttpServer;
import {Context, Middleware} from 'koa';
import * as Router from 'koa-router';

export enum HttpMethod {
  HEAD,
  OPTIONS,
  GET,
  PUT,
  PATCH,
  POST,
  DELETE
}

export abstract class Controller {
  router: Router;

  /**
   * 把当前 Controller 挂载到 rootRouter
   */
  constructor(rootRouter: Router) {
    rootRouter.use(this.router.routes(), this.router.allowedMethods());
  }
}

// decorator factory
export function route(path: string, method?: HttpMethod, ...middleware: Array<Middleware>) {
  return (target: Controller | Function, key?: string | symbol, descriptor?: any): void => {
    // Decorator applied to Class (for Constructor injection).
    if (typeof target === 'function' && key === undefined && descriptor === undefined) {
      if (!target.prototype.router) {
        target.prototype.router = new Router();
      }
      target.prototype.constructor = () => target.prototype.router;
      target.prototype.router.prefix(path);
      if (middleware.length > 0) {
        target.prototype.router.use(...middleware);
      }
      return;
    } else if (typeof target === 'object') {
      if (!target.router) {
        target.router = new Router();
      }
      const handleReturnMiddleware = function (ctx: Context) {
        const ret = descriptor.value(ctx);
        if (ret != null) {
          Promise.resolve(ret).then(function (data: any) {
            if (data != null) {
              ctx.body = {
                data: data,
              };
            }
          }).catch(function (err) {
            if (err) {
              const {code = 500, msg = String(err), data} = err;
              ctx.body = {
                code,
                msg,
                data,
              };
            }
          })
        }
      };
      // Decorator applied to member (method or property).
      switch (method) {
        case HttpMethod.HEAD:
          target.router.head(path, ...middleware, handleReturnMiddleware);
          break;
        case HttpMethod.OPTIONS:
          target.router.options(path, ...middleware, handleReturnMiddleware);
          break;
        case HttpMethod.GET:
          target.router.get(path, ...middleware, handleReturnMiddleware);
          break;
        case HttpMethod.PUT:
          target.router.put(path, ...middleware, handleReturnMiddleware);
          break;
        case HttpMethod.PATCH:
          target.router.patch(path, ...middleware, handleReturnMiddleware);
          break;
        case HttpMethod.POST:
          target.router.post(path, ...middleware, handleReturnMiddleware);
          break;
        case HttpMethod.DELETE:
          target.router.delete(path, ...middleware, handleReturnMiddleware);
          break;
        default:
          throw new Error('@route decorator "method" is not valid');
      }
    }
  };
}

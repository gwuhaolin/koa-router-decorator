import {Context, Middleware} from 'koa';
import * as Router from 'koa-router';
import * as fs from 'fs';

export enum HttpMethod {
  HEAD,
  OPTIONS,
  GET,
  PUT,
  PATCH,
  POST,
  DELETE,
  ALL,
}

/**
 * 找出目录下所有的文件
 */
function getFiles(dir: string, files_?: string[]): string[] {
  files_ = files_ || [];
  const files = fs.readdirSync(dir);
  for (let i in files) {
    const name = dir + '/' + files[i];
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, files_);
    } else {
      files_.push(name);
    }
  }
  return files_;
}

/**
 * 格式化返回数据的格式
 */
async function formatResponse(descriptor: any, ctx: Context) {
  const ret = descriptor.value(ctx);
  if (ret != null) {
    try {
      const data = await Promise.resolve(ret);
      if (data != null) {
        // 正常格式
        ctx.body = data;
      }
    } catch (err) {
      if (err) {
        const {code = err.code || 500, msg = err.message || err.msg ||  err.error || JSON.stringify(err), data} = err;
        // 错误格式
        ctx.body = {
          code,
          msg,
          data,
        };
        ctx.status = 500;
        // 非线上环境记录错误
        if (process.env.NODE_ENV != 'production') {
          console.trace(err);
        }
      }
    }
  }
}

const router = new Router();

// @router 装饰器
export function route(path: string, method?: HttpMethod, ...middleware: Array<Middleware>) {
  return (target: any, key?: string | symbol, descriptor?: any): void => {
    // Decorator applied to Class (for Constructor injection).
    if (typeof target === 'function' && key === undefined && descriptor === undefined) {
      if (!target.prototype.router) {
        target.prototype.router = new Router();
      }
      if (middleware.length > 0) {
        target.prototype.router.use(...middleware);
      }
      router.use(path, target.prototype.router.routes(), target.prototype.router.allowedMethods());
      return;
    } else if (typeof target === 'object') {
      if (!target.router) {
        target.router = new Router();
      }
      const handleReturnMiddleware = async function (ctx: Context) {
        await formatResponse(descriptor, ctx);
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
          target.router.del(path, ...middleware, handleReturnMiddleware);
          break;
        default:
          target.router.all(path, ...middleware, handleReturnMiddleware);
          break;
      }
    }
  };
}

/**
 * 加载所有controller文件
 * @param controllersDir 陈放所有route的文件夹路径
 * @param extension 只导入对应后缀的文件作为route，默认导入所有的.js文件
 */
export function load(controllersDir: string, extension: string = '.js'): Router {
  getFiles(controllersDir).forEach((file) => {
    if (file.endsWith(extension)) {
      require(file);
    }
  });
  return router;
}

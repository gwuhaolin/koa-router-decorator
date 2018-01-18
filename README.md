# koa-decorator
@route decorator for koa-router

## Use
install by:
```bash
npm i koa-decorator
```
then use in code:
```js
import {HttpMethod, route} from 'koa-decorator';

@route('/monitor')
export default class MonitorCtrl{

  @route('/alive', HttpMethod.GET)
  async alive() {
    // this === ctx
    this.body = {
      data: true,
    };
  }
}
```
register to router:
```js
import {load} from 'koa-decorator';
const apiRouter = load(path.resolve(__dirname, 'route'));
app.use(apiRouter.routes()).use(apiRouter.allowedMethods());
```

## Use auth middleware
```js
import {HttpMethod, route} from 'koa-decorator';
import {Context} from 'koa';

function auth(ctx) {
  if(!ctx.auth){
      ctx.response.status = 401;
  }
}

@route('/monitor')
export default class MonitorCtrl {

  @route('/alive', HttpMethod.GET,auth)
  async alive() {
    this.body = {
      data: true,
    };
  }
}
```

## Return data direct
The following code has the same effect as above:
```js
@route('/monitor')
export default class MonitorCtrl {

  @route('/alive', HttpMethod.GET,auth)
  async alive() {
    return {
      data: true,
    };
  }
  
  @route('/echoParams', HttpMethod.GET,auth)
  echoParams(param) {
    // param的值就是请求的url中的query和body中解析出的参数的合并结果
    return param;
  }
}
```

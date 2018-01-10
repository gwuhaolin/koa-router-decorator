# koa-decorator
@route decorator for koa-router

## Use
install by:
```bash
npm i koa-decorator
```
then use in code:
```js
import {Controller, HttpMethod, route} from 'koa-decorator';
import {Context} from 'koa';

@route('/monitor')
export default class MonitorCtrl extends Controller {

  @route('/alive', HttpMethod.GET)
  async alive(ctx: Context) {
    ctx.body = {
      data: true,
    };
  }
}
```
register to router:
```js
import * as Router from 'koa-router';
import MonitorCtrl from './monitor';

const rootRouter = new Router({
  prefix: '/api'
});

new MonitorCtrl(rootRouter);
app.use(rootRouter.routes()).use(rootRouter.allowedMethods());
```

## Use auth middleware
```js
import {Controller, HttpMethod, route} from 'koa-decorator';
import {Context} from 'koa';

function auth(ctx) {
  if(!ctx.auth){
      ctx.response.status = 401;
  }
}

@route('/monitor')
export default class MonitorCtrl extends Controller {

  @route('/alive', HttpMethod.GET,auth)
  async alive(ctx: Context) {
    ctx.body = {
      data: true,
    };
  }
}
```

## Return data direct
The following code has the same effect as above:
```js
@route('/monitor')
export default class MonitorCtrl extends Controller {

  @route('/alive', HttpMethod.GET,auth)
  async alive(ctx: Context) {
    return {
      data: true,
    };
  }
  
  @route('/alive', HttpMethod.GET,auth)
  alive(ctx: Context) {
    return {
      data: true,
    };
  }
}
```

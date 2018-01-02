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
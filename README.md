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
  async alive(ctx) {
    ctx.body = {
      data: true,
    };
  }
}
```
register to router:
```js
import {load} from 'koa-decorator';
const apiRouter = load(path.resolve(__dirname, 'route'));
// const apiRouter = load(path.resolve(__dirname, 'route', '.ts')); // only require .ts files as route
app.use(apiRouter.routes()).use(apiRouter.allowedMethods());
```

## Use auth middleware
```js
import {HttpMethod, route} from 'koa-decorator';

function auth(ctx) {
  if(!ctx.auth){
      ctx.response.status = 401;
  }
}

@route('/monitor')
export default class MonitorCtrl {

  @route('/alive', HttpMethod.ALL, auth)
  async alive(ctx) {
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
export default class MonitorCtrl {

  @route('/alive', HttpMethod.GET, auth)
  async alive() {
    return {
      data: true,
    };
  }
}
```

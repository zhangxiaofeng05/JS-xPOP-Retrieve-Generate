import Koa from "koa";
const app = new Koa();

import router from './router/index.js';

import bodyParser from "koa-bodyparser";

app.use(bodyParser());
app.use(router.routes());
app.use(router.allowedMethods());

// response
app.use(ctx => {
    ctx.body = 'Hello Koa';
});

app.listen(8080,'0.0.0.0');
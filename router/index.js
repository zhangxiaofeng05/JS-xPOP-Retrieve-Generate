import KoaRouter from "koa-router";
const router = new KoaRouter();
import {setVerbose,setEndpoints,xpop} from "xpop";

router.get("/ping", (ctx) => {
  ctx.body = "ok";
});

router.post('/setVerbose', warpSetVerbose)
    .post('/setEndpoints',wrapSetEndpoints)
    .post('/xpop',wrapXpop);

async function warpSetVerbose(ctx) {
  let params = ctx.request.body;
  let verbose = params.setVerbose;
  console.log("warpSetVerbose verbose:",verbose);
  setVerbose(verbose);
  ctx.body = APISuccessRender(verbose);
  return ctx.body;
}

async function wrapSetEndpoints(ctx) {
  let params = ctx.request.body;
  let endpoints = params.setEndpoints;
  console.log("wrapSetEndpoints endpoints",endpoints);
  setEndpoints(endpoints);
  ctx.body = APISuccessRender(endpoints);
  return ctx.body;
}

async function wrapXpop(ctx) {
  let params = ctx.request.body;
  // let endpoints = params.setEndpoints;
  // console.log(endpoints);
  // setEndpoints(endpoints);
  console.log("wrapXpop params:",params);
  let txHash = params.txHash;
  let ledgerIndex = params.ledgerIndex;
  let networkId = params.networkId;
  let forceFromSource = params.forceFromSource;
  let res = await xpop(txHash, ledgerIndex, networkId, forceFromSource);
  ctx.body = APISuccessRender(res);
  return ctx.body;
}

function APISuccessRender(data, code = 0, msg = 'ok') {
  return {ret: code, msg, data};
}

export default router;
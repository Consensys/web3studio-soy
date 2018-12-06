const Koa = require('koa');
const app = new Koa();
const ENS = require('./helpers/Ens');
const httpProxy = require('http-proxy');

const ens = new ENS();
const proxy = httpProxy.createProxyServer();
const gateway = 'https://gateway.ipfs.io';
const ipfsPattern = /^\/ipfs\/Qm\w{44}\/.*$/;

// response
app.use(async (ctx, next) => {
  let path = '';

  ctx.respond = false;
  const ensName = 'web3studio.eth';

  if (!ctx.url.match(ipfsPattern)) {
    path = await ens.resolveContenthash(ensName);
  }

  proxy.web(ctx.req, ctx.res, {
    target: `${gateway}${path}`,
    changeOrigin: true
  });

  await next();
});

app.listen(3000);

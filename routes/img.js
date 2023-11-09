/**
 * 随机图片 API
 * @param {number} id - 指定要获取的图片ID，从1开始，跳转至images中的第{id}张图片
 * @param {number} json - 返回json格式数据
 * @param {string} raw - 服务端加载并返回
 */

const Router = require("koa-router");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const imageRouter = new Router();

const ALLOW_RAW_OUTPUT = process.env.ALLOW_RAW_OUTPUT || false;

// 获取列表数据
imageRouter.get("/img", async (ctx) => {
  try {
    let imageDir = path.join(__dirname, "../public/images");
    let imgsArray = fs.readdirSync(imageDir);

    // 拿到参数ID
    let { id } = ctx.query;
    id = parseInt(id);
    if (id && id > 0 && id <= imgsArray.length) {
      ctx.response.set("Cache-Control", "public, max-age=86400");
    } else {
      ctx.response.set("Cache-Control", "no-cache");
      id = Math.ceil(Math.random() * imgsArray.length);
    }

    // json 格式
    if ("json" in ctx.query) {
      ctx.response.set("Content-Type", "application/json");
      ctx.body = {
        code: 200,
        id,
        url: imgsArray[id - 1],
      };
      return;
    }
    const imageUrl = path.join(imageDir, imgsArray[id - 1]);

    // 服务端读取图片后回传
    if ("raw" in ctx.query) {
      if (!ALLOW_RAW_OUTPUT) {
        ctx.throw(403);
        return;
      }
      ctx.response.set("Content-Type", "image/jpeg");
      ctx.body = fs.createReadStream(imageUrl);

      //   const imageResponse = await axios.get(
      //     "https://z3.ax1x.com/2021/08/19/fqDQns.png",
      //     {
      //       responseType: "arraybuffer",
      //     }
      //   );
      //   ctx.body = Buffer.from(imageResponse.data, "binary");
      return;
    }

    ctx.set("Referrer-Policy", "no-referrer");
    ctx.redirect(`/images/${imgsArray[id - 1]}`);
  } catch (error) {
    console.error(error);
    ctx.status = 500;
    ctx.body = {
      code: 500,
      message: error.message,
    };
  }
});

module.exports = imageRouter;
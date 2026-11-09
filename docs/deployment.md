# AWS 部署

- 仓库：`https://github.com/lengjian1986/caba-night-web`，分支 `main`。
- EC2：`98.81.182.132`（Amazon Linux 2023），复用 Nginx。
- Web：`https://web.98.81.182.132.sslip.io`。
- API：`https://98.81.182.132.sslip.io`，保持现有公开数据接口。
- Web 独立虚拟主机；现有管理后台、旧 Flutter Web、其他虚拟主机不改动。

## 目录与发布方式

服务器 Git 源码：`/home/ec2-user/caba-night-web/repository`。

静态版本：`/var/www/caba-night-web/releases/<commit-sha>`；Nginx 根目录指向 `current` 软链接。每次发布新版本后原子切换软链接，保留旧版本供回滚。`/release.json` 返回本次源代码提交号。

服务器磁盘有限，所以在开发机的干净 Git 检出目录运行 `npm ci`、`npm run build`，上传构建包。发布前对照 GitHub 分支提交号和服务器拉取的提交号，确保来源一致。运行时无需 Node、npm 或新的 Docker 镜像。

## 首次配置

1. 服务器克隆仓库；根据固定提交构建 `dist`。
2. 安装 `deploy/nginx.http.conf` 为 `/etc/nginx/conf.d/caba-night-web.conf`，执行 `sudo nginx -t` 后 reload。
3. 通过 Certbot webroot 签发证书，证书名 `caba-night-web`，域名 `web.98.81.182.132.sslip.io`，webroot `/usr/share/nginx/html`。
4. 将构建包解压到对应 release 目录，建立 `current` 软链接。
5. 换成 `deploy/nginx.https.conf`，检查配置并 reload。
6. 检查 HTTPS、HTTP 跳转、详情深链接、静态资源及跨域 API 请求。证书续期使用服务器现有 Certbot 定时任务，并配置 deploy hook 验证及 reload Nginx。

## 后续发布

在干净检出目录拉取 `main`，执行 `npm ci` 和 `npm run build`。将当前提交号写入 `dist/release.json`，打包并传至服务器。服务器源码也先 `git pull --ff-only`，核对同一提交后再解压与切换 `current`。

不要上传 `.env`、SSH 私钥、后台 Token、`node_modules` 或后台备份。不将构建产物提交到 Git。API 域名如需更改，构建时配置 `VITE_API_ORIGIN`。

## 回滚

将 `current` 原子切换到上一 release 目录即可；无需修改 API 或数据库。Nginx 配置修改前在服务器本地备份，保留已有配置及证书。

# 和平sh配置网站静态部署

本项目已经准备好静态网页文件：
- `index.html`（从 `pubg_id_query.html` 复制）
- `assets/skins/`（图片目录）
- `DB.json`, `pubg_id_query.html` 等文件

## 1. GitHub Pages（推荐最简单）
1. 创建一个 GitHub 仓库（例如 `pubg-skin-query`）。
2. 提交当前目录所有文件到该仓库。
3. 在 GitHub 仓库页面选择 `Settings` > `Pages`。
4. Source 选择 `main` 分支，根目录 `/`。
5. 保存后几分钟，访问：
   `https://<用户名>.github.io/<仓库名>/`
6. 访问：`https://<用户名>.github.io/<仓库名>/index.html` 即可。

## 2. 本地临时测试（也可给别人内网看）
在项目根目录运行：

```bash
# Python 3
python -m http.server 8080

# 或 Node
npx serve .
```

访问：`http://localhost:8080/`

## 3. 线上静态站（nginx）
1. 把目录放到服务器指定目录，例如 `/var/www/pubg`。
2. nginx 配置：

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/pubg;
    index index.html;
}
```

3. 重载 nginx：`sudo nginx -s reload`。

## 4. 重要提示
- 如果你要共享给外网：请确保 `assets/skins` 文件夹不丢失，图片已占用空间较大。
- 如果发生“加载慢”，可考虑单独启用 gzip 压缩并缓存静态资源。

# ft_transcendence

- [RESOURCES](https://quilled-discovery-253.notion.site/ft_transcendence-01d977dd4ba8439daa74b019bfec495b)

## Usage

/backend/api/.env.sample/default.env内の以下に正しい値を入れる

```
UID=''
SECRET=''
```

`make build`で起動。

## Makefile

- build: 起動（イメージの作成含む）
- db: defaultユーザーの作成とrandomユーザーの作成
- restart: コンテナを再起動
- format_frontend: frontendコンテナ内で`npm run format`を実行
- lint_frontend: frontendコンテナ内で`npm run lint`を実行
- format_backend: apiコンテナ内で`npm run format`を実行
- lint_backend: apiコンテナ内で`npm run lint`を実行
- down: コンテナを停止し、一部の情報を削除
- image_clean: イメージの全削除
- volume_clean: volumeの全削除
- clean: 稼働していないコンテナの情報をすべて削除（一部残る場合もある）
- fclean: image, volume, network, container等すべて削除

## pgadmin
```
email: admin@gamil.com
password: admin
```

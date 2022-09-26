# ft_transcendence

## Overview

We created a web application with chat and games.

## Requirement

- docker compose
- chrome or safari
- 42 API Key (Required if using 42 API)

## Usage

First  you need to put the correct values in the file.

/backend/api/.env.sample/default.env

```
# 42Access
UID=''
SECRET=''
```

Then, `make build`.

You can access our app by going to http://localhost:3001

## Makefile

- build: Execution including image creation
- db: Creating a default user and a random user
- restart: Restart container
- down: Stop container
- image_clean: Delete all images
- volume_clean: Delete all volumes
- clean: Delete all information on inactive containers (some may remain)
- fclean: clean and volume_clean and image_clean

## Features

- Backend is NestJS
- Frontend is NextJs
- User
    - Sign up using 42API is available
    - You can also register using your password
    - You can change your profile
    - Friend function is available
    - Block function is available
- Chat
    - You can create public, private, and protected channels
    - To write to a channel, you need to JOIN the channel
    - The person who created the channel becomes the owner and can appoint an administrator and even be the administrator themself
    - Administrators can ban or mute
    - You can invite friends to chat
    - DM functionality is also available
- Game
    - Created with respect to the game "pong"
    - You can invite other users to pong
    - You can also play pong with random matching
    - You can see the game results and other information
    - You can watch other people's games

## Author

Yuske Fukuyama: [github](https://github.com/fkymy)

U (mfunyu): [github](https://github.com/mfunyu)

knoda: [github](https://github.com/odkaz)

syamaguc: [github](https://github.com/syamaguc)

kota (ksuzuki): [github](https://github.com/kotabrog)

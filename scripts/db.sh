#!/bin/bash

# make default user
declare -a arr=("syamaguc" "ksuzuki" "mfunyu" "knoda" "yufukuya")

for i in "${arr[@]}"
do
  curl -X POST 'localhost:3000/api/user/signup' -d "username=$i" -d "email=$i@example.com" -d "password=Test1234\!" -d "passwordConfirm=Test1234\!"
  echo
done

# make random 10 user
# ここでランダムに作成するユーザー数指定
for i in $(seq 1 10)
do
  NAME=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 8 | head -n 1 | sort | uniq)
  curl -X POST 'localhost:3000/api/user/signup' -d "username=$NAME" -d "email=$NAME@example.com" -d "password=Test1234\!" -d "passwordConfirm=Test1234\!"
  echo
done



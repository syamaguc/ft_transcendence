## Usage
```
cp .env.sample .env

```


## API
```
curl http://localhost:3000/users
curl http://localhost:3000/users/{id}
curl -x POST http://localhost:3000/users -d 'name=syamaguc' -d 'status=ON'
curl -X PATCH http://localhost:3000/users/2 -d 'status=OFF'
curl -X DELETE http://localhost:3000/users/2
```

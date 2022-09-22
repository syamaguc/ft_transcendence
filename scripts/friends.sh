#!/bin/bash

# Token of user to add friends to
# e.g. `export MY_TOKEN=token` before running this script
echo $MY_TOKEN

sign_up () {
    local NAME=$1
    local JSON=$(curl -X 'POST' \
        'localhost:3000/api/user/signup' \
        -d "username=$NAME" \
        -d "email=$NAME@example.com" \
        -d "password=Test1234\!" \
        -d "passwordConfirm=Test1234\!")
    local TOKEN=$(echo $JSON | cut -d '"' -f 4)
    echo $TOKEN
}

get_user_id () {
    local TOKEN=$1
    local JSON=$(curl -X 'GET' \
        'http://localhost:3000/api/user/currentUser' \
        -H "Cookie: jwt=$TOKEN" \
        -H 'accept: */*')
    local USERID=$(echo $JSON | cut -d '"' -f 4)
    echo $USERID
}

add_friend () {
    local TOKEN=$1
    local USERID=$2
    curl -X 'PATCH' \
        'http://localhost:3000/api/user/addFriend' \
        -H "Cookie: jwt=$TOKEN" \
        -H 'accept: */*' \
        -H 'Content-Type: application/json' \
        -d "{
        \"userId\": \"$USERID\"
    }"
}

sign_out () {
    local TOKEN=$1
    curl -X 'DELETE' \
        'http://localhost:3000/api/user/logout' \
        -H "Cookie: jwt=$TOKEN" \
        -H 'accept: */*'
}

main () {
    if [[ ! $MY_TOKEN ]] ; then
        echo "set MY_TOKEN by running 'export MY_TOKEN=token'"
        exit
    fi

    echo "Adding friends to user:"
    curl -X 'GET' \
        'http://localhost:3000/api/user/currentUser' \
        -H "Cookie: jwt=$MY_TOKEN" \
        -H 'accept: */*'

    for i in $(seq 1 20)
    do
        NAME="user${i}"
        echo "Creating user $NAME"

        TOKEN=$(sign_up $NAME)
        USERID=$(get_user_id $TOKEN)

        echo "token: $TOKEN"
        echo "user_id: $USERID"

        add_friend $MY_TOKEN $USERID
        sign_out $TOKEN
    done
}

main "$@"


build:
	cp -R backend/api/.env.sample backend/api/.env 
	docker-compose up --build

down:
	docker-compose down

volume_clean:
	docker volume prune -f

fclean:
	docker system prune

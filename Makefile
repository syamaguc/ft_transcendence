build:
	docker-compose up --build

down:
	docker-compose down

volume_clean:
	docker volume prune -f

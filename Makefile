build:
	@if [ ! -d backend/api/.env ]; then\
  	echo ".env Directory not exists."; \
		cp -r backend/api/.env.sample backend/api/.env; \
	fi
	docker-compose up --build

down:
	docker-compose down

volume_clean:
	docker volume prune -f

fclean:
	docker system prune

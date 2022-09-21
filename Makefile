build:
	@if [ ! -d backend/api/.env ]; then\
  	echo ".env Directory not exists."; \
		cp -r backend/api/.env.sample backend/api/.env; \
	fi
	docker-compose up --build

restart:
	docker-compose up

format_frontend:
	docker-compose exec frontend npm run format

lint_frontend:
	docker-compose exec frontend npm run lint

format_backend:
	docker-compose exec api npm run format

lint_backend:
	docker-compose exec api npm run lint

down:
	docker-compose down

image_clean:
	docker rmi $$(docker images -a -q)

volume_clean:
	docker volume prune -f

db:
	bash db.sh

clean:
	docker system prune -f

fclean: clean volume_clean image_clean

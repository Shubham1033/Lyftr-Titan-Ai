.PHONY: up down build logs test clean help

help:
	@echo "Available commands:"
	@echo "  make up      - Start the entire stack (backend on :8000, frontend on :3000)"
	@echo "  make down    - Stop all running containers"
	@echo "  make build   - Rebuild Docker images without cache"
	@echo "  make logs    - Tail container logs"
	@echo "  make test    - Run backend unit and integration tests"
	@echo "  make clean   - Remove containers, volumes, and temporary files"

up:
	docker compose up --build -d

down:
	docker compose down

build:
	docker compose build --no-cache

logs:
	docker compose logs -f

test:
	cd backend && python -m pytest test_main.py -v

clean:
	docker compose down -v
	rm -rf backend/__pycache__ backend/.pytest_cache frontend/dist

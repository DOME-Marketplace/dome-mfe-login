.PHONY: dev build test lint docker-build docker-run

dev:
	npx ng serve --open

build:
	npx ng build --configuration=production

test:
	npx ng test --watch=false

lint:
	npx ng lint

docker-build:
	docker build -t eudistack/portal-acceso-ui:latest .

docker-run:
	docker run --rm -p 4200:80 \
		-v $(PWD)/themes/dome.json:/usr/share/nginx/html/assets/theme.json:ro \
		eudistack/portal-acceso-ui:latest

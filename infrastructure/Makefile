docker:
	docker run -it --rm -w /app -v ${PWD}:/app --env-file .env hashicorp/terraform:1.3.1 $(ARG)

init:
	make docker ARG="init"

plan:
	make docker ARG="plan"

apply:
	make docker ARG="apply"

destroy:
	make docker ARG="destroy"
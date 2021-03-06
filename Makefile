base_dir :=$(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))

local_name = ohbm_2020
tag ?= v2
run_cmd ?= jupyter notebook

.PHONY: build
build:
	@echo Building $(local_name):$(tag)
	@docker build -t $(local_name):$(tag) .

run:
	@open http://localhost:8081
	@docker run -p 8081:8888 --rm -it $(local_name):$(tag) $(run_cmd)

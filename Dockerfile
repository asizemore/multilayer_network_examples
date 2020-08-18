FROM jupyter/datascience-notebook:9f4983c5d1f3

RUN pip install networkx
RUN pip install utils
RUN pip install git+https://github.com/nkoub/multinetx.git
RUN pip install "flask==1.0.1" "CairoSVG==2.1.3"




USER root
RUN apt-get update && apt-get install -y \
  libz-dev  
  # curl\
  # nodejs
USER jovyan

# # # update 
# # RUN apt-get update
# # # install curl 
# # RUN apt-get install curl
# # # get install script and pass it to execute: 
# RUN curl -sL https://deb.nodesource.com/setup_12.x
# # and install node 
# # RUN apt-get install nodejs
# # confirm that it was successful 
# RUN node -v
# # npm installs automatically 
# RUN npm -v
# RUN npm i d3-save-svg


EXPOSE 8888

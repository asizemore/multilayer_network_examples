FROM jupyter/datascience-notebook:latest

RUN pip install plotly
RUN pip install cufflinks
RUN pip install networkx
RUN pip install matplotlib-venn
RUN pip install bctpy
RUN pip install bokeh==1.3.4
RUN pip install utils
RUN pip install python-igraph
RUN pip install louvain
RUN pip install git+https://github.com/nkoub/multinetx.git
RUN pip install "flask==1.0.1" "CairoSVG==2.1.3"




USER root
RUN apt-get update && apt-get install -y \
  libz-dev
USER jovyan



EXPOSE 8888

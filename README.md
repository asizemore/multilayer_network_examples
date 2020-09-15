# Visualization of small multilayer networks. Code to accompany OHBM 2020 [presentation](https://www.aesizemore.com/data-visualization.html).


![MX network](assets/ohbm_multilayerNets-45.png)


### This repository contains three functions that create interactive plots of multilayer networks, that can then be downloaded as svg files. For examples, see the `visualization_example_output.html` and `visualization_example_output_timeseries.html` files.

------

*Notes:* 
- This code relies on the [d3-save-svg package](https://github.com/edeno/d3-save-svg). In the d3-save-svg-ph-pages folder, only the assets/d3-save-svg.min.js file is used so that is all that is kept (downloaded 05.29.20).

- Developed and tested on Chrome and MacOS. 

- The download svg buttons may not work (depends on browser version) if opening the html files direcly out of the jupyter page. If the buttons do not work, open the html file locally instead. I am actively working on a fix.

----

## Setting up the notebook with Docker

The visualization code could be run on its own, but using the code within the provided Docker file is strongly recommended. To create the image, follow the steps below.

1. Ensure Docker and make compiler are installed.
2. Navigate to the appropriate directory and run `make build` to build the image.
3. Run the docker image by executing `docker run -it --rm -p 8888:8888 -v $(pwd):/home/jovyan/ ohbm_2020:v2`. This command will return an address on port 8888 where the jupyter notebook will be running. This command also mounts the current directory to /home/jovyan/.
4. Follow the returned address to open the jupyter tree and enjoy!


-------

## Three basic functions

The three functions included in the `mx_viz.py` file are:
- mx_viz.write_mx_to_json. Takes a [multinetx](https://pypi.org/project/multinetx/) graph object and writes the information to a json file.
- mx_viz.visualize. Takes a json-ified multinetx graph (output of mx_viz.write_mx_to_json) and returns an html file that displays the multilayer network and the correspnoding supra-adjacency matrix. 
- mx_viz.visualize_timeseries. Works the same as above but expects the input multilayer network to have ordered layers (for example, a temporal network). 

---

## Basic use: `mx_viz_examples.ipynb`.

The `mx_viz_examples.ipynb` runs through examples of generating simple multilayer networks and plotting them with mx_viz.


## Instructions to reproduce figures from OHBM 2020 [presentation](https://www.aesizemore.com/data-visualization.html).

If you are interested in reproducing figures from the presentation, all of the code can be found in the `slide_figures.ipynb` notebook.


Last major update 09.15.20.


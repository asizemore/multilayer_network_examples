# Example multilayer network code to accompany OHBM 2020 educational workshop.



------
*Note:* This code relies on the [d3-save-svg package](https://github.com/edeno/d3-save-svg). In the d3-save-svg-ph-pages folder, only the assets/d3-save-svg.min.js file is used so that is all that is kept (downloaded 05.29.20).

*Note:* This code was developed and tested on Chrome and MacOS. 



----

## Instructions to reproduce figures from OHBM 2020 presentation

0. Install docker desktop.
1. Build the docker image with `make build`.
2. Run the docker image with `docker run -it --rm -p 8888:8888 -v $(pwd):/home/jovyan/ ohbm_2020:ann-dev`
3. Copy and paste the 127.0.0 ... path into your browser (Chrome tested).
4. Run the `slide_figures.ipynb` notebook. Use this notebook as a template for creating figures from your own multilayer network data!
5. Running that notebook should have generated five .json files within the `data` folder. Check to make sure this happened.
6. For vertically stacked multilayer networks, we use the `mx_viz.html` file. If we want it to load the `mx_2layers.json` file, we insert the filename into the d3.json function in line 13 of `mx_viz.js`. 
7. Open the `mx_viz.html` file however you please. I use the python simple server, so in the command line and within the current directory run `python -m SimpleHTTPServer 9000` and then direct your browser to 127.07.0.0.1:9000. 
8. For horizontally stacked multilayer networks that should be sequentially ordered (such as time series), use the `mx_viz_timeseries.html` file. Change the .json file to be loaded at line 13 of `mx_viz_timeseries.js`.
9. Click the buttons at the bottom right of the screen to save the multilayer network (Save mx) or the supra-adjacency matrix (save sadj).


Last updated 05.30.20


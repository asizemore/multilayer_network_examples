# Functions for visualization
import numpy as np
import networkx as nx
import multinetx as mx
from jinja2 import Environment, FileSystemLoader, Template
import json
from networkx.readwrite import json_graph


def write_mx_to_json(filename, mg, nNodes, pos, nLayers, nodes_to_remove = []):
    
    # filename the complete name of the output file (data/slide_x.json)
    # mx the multilayer network as a multinetx object
    # nNodes the number of nodes in the first layer
    # pos a dictionary of node coordinates
    # nLayers the number of layers in the second aspect.
    # nodes_to_remove is a list of nodes that should not exist in each layer. Default = []
    

    
    
    # From the sparse adj, make a networkx graph and add node attributes
    G1 = nx.from_numpy_array(mx.adjacency_matrix(mg,weight='weight').todense())

    # Remove nodes from G
    G1.remove_nodes_from(nodes_to_remove)

    # Recreate the graph G to make the rest work nicely.

    G = nx.from_numpy_array(nx.adjacency_matrix(G1).todense())


    # Create dictionaries pretending like all nodes exist
    scalefact = 20
    L2_classes = np.arange(nLayers)
    L2_array_original = np.array([])
    z_shift = 2
    z_array_original = np.array([])
    x_orig = np.array([])
    y_orig = np.array([])
    L1_orig = np.array([])
    for level in L2_classes:
        L2_array_original = np.concatenate((L2_array_original, np.array([float(level) for i in np.arange(nNodes)])))
        z_array_original = np.concatenate((z_array_original, np.array([float(level*z_shift) for i in np.arange(nNodes)])))
        x_orig = np.concatenate((x_orig, [pos[key][0]+scalefact for key in pos]))
        y_orig = np.concatenate((y_orig, [pos[key][1]+scalefact for key in pos]))
        L1_orig = np.concatenate((L1_orig, [i for i in np.arange(nNodes)]))

    # Need to delete nodes from our attribute dictionaries, too
    L2_array = np.delete(L2_array_original, nodes_to_remove, 0)
    z_array = np.delete(z_array_original, nodes_to_remove, 0)
    x_array = np.delete(x_orig, nodes_to_remove, 0)
    y_array = np.delete(y_orig, nodes_to_remove, 0)
    L1_array = np.delete(L1_orig, nodes_to_remove, 0)

    ## Each node will get attributes L1=node id, L2=slice number, x position, y position, and name/id

    id_dict = {i:("id"+str(i)) for i in np.arange(nNodes*nLayers)}
    x_dict = {}
    y_dict = {}
    L2_dict = {i:l2 for i,l2 in enumerate(L2_array)}
    z_dict = {i:z_val for i,z_val in enumerate(z_array)}
    x_dict = {i:x_val for i,x_val in enumerate(x_array)}
    y_dict = {i:y_val for i,y_val in enumerate(y_array)}
    L1_dict = {i:L1_val for i,L1_val in enumerate(L1_array)}


    nx.set_node_attributes(G, id_dict, name = "name")
    nx.set_node_attributes(G, x_dict, name = "x")
    nx.set_node_attributes(G, y_dict, name = "y")
    nx.set_node_attributes(G, z_dict, name = "z")
    nx.set_node_attributes(G, L1_dict, name= "L1")
    nx.set_node_attributes(G, L2_dict, name= "L2")


    G_json = json_graph.node_link_data(G)
    
    # Write for visualization function
    G_json_viz = json.dumps(G_json, indent = 4)  
    
    # To save as a .json file
    with open(filename, 'w') as fp:
        json.dump(G_json, fp)

    print(f"done writing mx to {filename}")
    
    return G_json_viz





#Finished defining functions
print("finished defining functions")


def visualize(
        mxgraph,
        theme="dark",
        path_html="visualization_output.html",
        title="MX viz",
        save_file=True,
    ):
    

    # Find the module absolute path and locate templates
#     module_root = os.path.join(os.path.dirname('./'), "templates")
    module_root = "./"
    env = Environment(loader=FileSystemLoader(module_root))

    
    # Read in the D3 save pages code and include in the exported html
    d3_save_svg_path = "./d3-save-svg-gh-pages/assets/d3-save-svg.min.js"
    with open(d3_save_svg_path,'r') as f:
        d3_save_svg = f.readlines()

  
    if theme=="dark":
        
        js_path = './javascript/mx_viz.js'
        with open(js_path, "r") as f:
            js_text = f.read()
        
        css_path = './style/style.css'
        with open(css_path, "r") as f:
            css_text = f.read()
            
        # Jinja
        template = env.get_template("./templates/mx_viz.html").render(
            title=title,
            js_text=js_text,
            css_text=css_text,
            mxgraph=mxgraph,
            d3_save_svg=d3_save_svg[0]
        )
        
    elif theme == "light":
        
        js_path = './javascript/mx_vizlighttheme.js'
        with open(js_path, "r") as f:
            js_text = f.read()
        
        css_path = './style/style_lighttheme.css'
        with open(css_path, "r") as f:
            css_text = f.read()
            
        # Jinja
        template = env.get_template("./templates/mx_viz_lighttheme.html").render(
            title=title,
            js_text=js_text,
            css_text=css_text,
            mxgraph=mxgraph,
            d3_save_svg=d3_save_svg[0]
        )
        

            

    if save_file:
        with open(path_html, "wb") as outfile:
            print("Wrote visualization to: %s" % (path_html))
            outfile.write(template.encode("utf-8"))

    return template

def visualize_timeseries(
        mxgraph,
        path_html="visualization_timeseries_output.html",
        title="MX viz",
        save_file=True,
    ):
    

    # Find the module absolute path and locate templates
#     module_root = os.path.join(os.path.dirname('./'), "templates")
    module_root = "./"
    env = Environment(loader=FileSystemLoader(module_root))
    
    # Read in the D3 save pages code and include in the exported html
    d3_save_svg_path = "./d3-save-svg-gh-pages/assets/d3-save-svg.min.js"
    with open(d3_save_svg_path,'r') as f:
        d3_save_svg = f.readlines()


    # Find the absolute module path and the static files
#         js_path = os.path.join(os.path.dirname(__file__), "static", "kmapper.js")
    js_path = './javascript/mx_viz_timeseries.js'
    with open(js_path, "r") as f:
        js_text = f.read()


    css_path = './style/style_timeseries.css'
    with open(css_path, "r") as f:
        css_text = f.read()

    # Jinja
    template = env.get_template("./templates/mx_viz_timeseries.html").render(
        title=title,
        js_text=js_text,
        css_text=css_text,
        mxgraph=mxgraph,
        d3_save_svg=d3_save_svg[0]
    )



    if save_file:
        with open(path_html, "wb") as outfile:
            print("Wrote visualization to: %s" % (path_html))
            outfile.write(template.encode("utf-8"))

    return template


# Updated function for writing a supra-adjacency (possibly directed) matrix.
def write_supraadj_to_json(filename, sadj, nNodes, pos, nLayers, nodes_to_remove = []):
    
    # filename the complete name of the output file (data/slide_x.json)
    # sadj the multilayer network as a supra-adjacency matrix
    # nNodes the number of nodes in the first layer
    # pos a dictionary of node coordinates
    # nLayers the number of layers in the second aspect.
    # nodes_to_remove is a list of nodes that should not exist in each layer. Default = []
    

    # Remove nodes from sadj
    sadj.remove_nodes_from(nodes_to_remove)

    # Recreate the graph G to make the rest work nicely.

    G = nx.from_numpy_array(nx.adjacency_matrix(sadj).todense(), create_using = nx.DiGraph)


    # Create dictionaries pretending like all nodes exist
    scalefact = 20
    L2_classes = np.arange(nLayers)
    L2_array_original = np.array([])
    z_shift = 2
    z_array_original = np.array([])
    x_orig = np.array([])
    y_orig = np.array([])
    L1_orig = np.array([])
    for level in L2_classes:
        L2_array_original = np.concatenate((L2_array_original, np.array([float(level) for i in np.arange(nNodes)])))
        z_array_original = np.concatenate((z_array_original, np.array([float(level*z_shift) for i in np.arange(nNodes)])))
        x_orig = np.concatenate((x_orig, [pos[key][0]+scalefact for key in pos]))
        y_orig = np.concatenate((y_orig, [pos[key][1]+scalefact for key in pos]))
        L1_orig = np.concatenate((L1_orig, [i for i in np.arange(nNodes)]))

    # Need to delete nodes from our attribute dictionaries, too
    L2_array = np.delete(L2_array_original, nodes_to_remove, 0)
    z_array = np.delete(z_array_original, nodes_to_remove, 0)
    x_array = np.delete(x_orig, nodes_to_remove, 0)
    y_array = np.delete(y_orig, nodes_to_remove, 0)
    L1_array = np.delete(L1_orig, nodes_to_remove, 0)

    ## Each node will get attributes L1=node id, L2=slice number, x position, y position, and name/id

    id_dict = {i:("id"+str(i)) for i in np.arange(nNodes*nLayers)}
    x_dict = {}
    y_dict = {}
    L2_dict = {i:l2 for i,l2 in enumerate(L2_array)}
    z_dict = {i:z_val for i,z_val in enumerate(z_array)}
    x_dict = {i:x_val for i,x_val in enumerate(x_array)}
    y_dict = {i:y_val for i,y_val in enumerate(y_array)}
    L1_dict = {i:L1_val for i,L1_val in enumerate(L1_array)}


    nx.set_node_attributes(G, id_dict, name = "name")
    nx.set_node_attributes(G, x_dict, name = "x")
    nx.set_node_attributes(G, y_dict, name = "y")
    nx.set_node_attributes(G, z_dict, name = "z")
    nx.set_node_attributes(G, L1_dict, name= "L1")
    nx.set_node_attributes(G, L2_dict, name= "L2")


    G_json = json_graph.node_link_data(G)
    
    # Write for visualization function
    G_json_viz = json.dumps(G_json, indent = 4)  
    
    # To save as a .json file
    with open(filename, 'w') as fp:
        json.dump(G_json, fp)

    print(f"done writing mx to {filename}")
    
    return G_json_viz




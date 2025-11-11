import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import json
import copy
import plotly.io as pio
import plotly.express as px
import os
pio.renderers.default='browser'

class Line:
    """A class defining a line
    
    Parameters
    ----------
    line_input : string or dict, optional
        Dictionary or path to the JSON object specifying line parameters
    """
    
    def __init__(self, line_input={}):
        
        if isinstance(line_input, str):
            with open(line_input) as input_json_handle:
                self._input_dict = json.load(input_json_handle)
        
        elif isinstance(line_input, dict):
            self._input_dict = copy.deepcopy(line_input)
        
        else:
            raise IOError("Input to Line class initializer must be a file or python dictionary, not type {0}.".format(type(line_input)))
        
        self.name = self._input_dict.get("name", "Unnamed")
        self.slope = self._input_dict.get("slope", 1.0)
        self.intercept = self._input_dict.get("intercept", 0.0)
        self.xmin = self._input_dict.get("xmin", 0.0)
        self.xmax = self._input_dict.get("xmax", 1.0)
    
    def __str__(self):
        string = "Name: {0}".format(self.name)
        string += "\n\tSlope: {0}".format(self.slope)
        string += "\n\tIntercept: {0}".format(self.intercept)
        string += "\n\tXmin: {0}".format(self.xmin)
        string += "\n\tXmax: {0}".format(self.xmax)
        return string
    
    def simple_plot(self, num=20):
        x_array = np.linspace(self.xmin, self.xmax, num)
        y_array1 = np.zeros(len(x_array))
        y_array2 = np.zeros(len(x_array))
        for i, x in enumerate(x_array):
            y_array1[i] = self.slope * x + self.intercept
            y_array2[i] = self.slope * 2 * x
        fig, axes = plt.subplots()
        axes.plot(x_array, y_array1, label='mx+c')
        axes.plot(x_array, y_array2, label='2mx')
        axes.set_xlabel("X")
        axes.set_ylabel("Y")
        axes.legend()
        
        plot_dir = "Images"
    
        FileName = f"simple_plot_{self.name}.png"
        output_path = os.path.join(plot_dir, FileName)
        fig.savefig(output_path)
        plt.close(fig)
        return FileName
    
    def browser_plot(self, num=20):
        x_array = np.linspace(self.xmin, self.xmax, num)
        y_array = np.zeros([2,len(x_array)])
        for i, x in enumerate(x_array):
            y_array[0,i] = self.slope * x + self.intercept
            y_array[1,i] = self.slope * 2 * x
        lines = pd.DataFrame()
        names = ["mx+C", "2mx"]
        for i in range(2):
            block = pd.DataFrame({'Name': [names[i]]*len(x_array),
                                  'X': x_array,
                                  'Y': y_array[i,:],
                                  '10Y': y_array[i,:]*10})
            lines = pd.concat([lines, block], axis=0)
        fig = px.line(lines,
                      x = 'X',
                      y = 'Y',
                      color = 'Name',
                      hover_name = 'Name',
                      hover_data = {'Name': False,
                                    'X': True,
                                    'Y': True,
                                    '10Y': True},
                      title = "Browser plot")
       
        plot_dir = "Images"
        FileName = f"browser_plot_{self.name}.html"
        output_path = os.path.join(plot_dir, FileName)
        pio.write_html(fig, output_path)
        return FileName

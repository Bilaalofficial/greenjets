from line import Line
import sys
import json

input_file = json.loads(sys.argv[1])


my_line = Line(input_file)
output_path=my_line.simple_plot(50)
print(output_path)
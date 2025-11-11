import matplotlib.pyplot as plt
import numpy as np
import uuid
import os
import sys

def generate_plot(x_points, y_points):
    fig, ax = plt.subplots(figsize=(6, 4)) 
    
    ax.plot(x_points, y_points)
    ax.set_title("User Defined Plot")
    ax.set_xlabel("X-axis")
    ax.set_ylabel("Y-axis")

    unique_filename = f"plot_{uuid.uuid4().hex[:8]}.png"
    plot_dir = "Images"
    plot_path = os.path.join(plot_dir, unique_filename)

    if not os.path.exists(plot_dir):
        os.makedirs(plot_dir)

    fig.savefig(plot_path)
    plt.close(fig)  
    return unique_filename

def main():
   
    x_points = list(map(float, sys.argv[1].split(":")))
    y_points = list(map(float, sys.argv[2].split(":")))

    if len(x_points) != len(y_points):
        print("Error: The number of X and Y points must be the same.")
        return

    plot_path = generate_plot(x_points, y_points)
    print(plot_path)
   
if __name__ == "__main__":
    main()

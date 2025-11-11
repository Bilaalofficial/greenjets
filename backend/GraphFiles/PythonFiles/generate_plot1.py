import matplotlib.pyplot as plt
import numpy as np
import uuid
import os

def generate_plot():
    x = np.linspace(0, 10, 100)
    y = np.sin(x)

    fig, ax = plt.subplots(figsize=(3, 2))
    ax.plot(x, y)
    ax.set_title("")
    ax.set_xlabel("X-axis")
    ax.set_ylabel("Y-axis")

    unique_filename = f"plot.png"
    plot_dir = "Images"
    plot_path=unique_filename

    
    if not os.path.exists(plot_dir):
        os.makedirs(plot_dir)

    fig.savefig(plot_path)
    return plot_path

if __name__ == "__main__":
    plot_path = generate_plot()
    print(plot_path)



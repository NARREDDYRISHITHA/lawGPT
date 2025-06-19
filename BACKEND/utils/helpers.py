"""
Helper utilities for the LawGPT application.
"""
import sys
from colorama import init, Fore, Style

# Initialize colorama for cross-platform colored terminal text
init()

# Color mapping for easier usage
COLOR_MAP = {
    "red": Fore.RED,
    "green": Fore.GREEN,
    "yellow": Fore.YELLOW,
    "blue": Fore.BLUE,
    "magenta": Fore.MAGENTA,
    "cyan": Fore.CYAN,
    "white": Fore.WHITE
}

def print_colored(text, color="white", bold=False):
    """
    Print colored text to terminal
    
    Args:
        text (str): Text to print
        color (str): Color name (red, green, yellow, blue, magenta, cyan, white)
        bold (bool): Whether to print in bold
    """
    color_code = COLOR_MAP.get(color.lower(), Fore.WHITE)
    style = Style.BRIGHT if bold else ""
    print(f"{style}{color_code}{text}{Style.RESET_ALL}")

def print_header():
    """Print application header"""
    print("\n" + "="*60)
    print_colored("LEGAL CASE RESEARCH ASSISTANT", "cyan", bold=True)
    print_colored("Helping law students find relevant case information", "cyan")
    print("="*60 + "\n")

def check_environment(required_vars):
    """
    Check if required environment variables are set
    
    Args:
        required_vars (list): List of required environment variable names
    
    Returns:
        bool: True if all required variables are set, False otherwise
    """
    import os
    missing_vars = []
    for var in required_vars:
        if not var in os.environ:
            missing_vars.append(var)
    
    if missing_vars:
        print_colored(f"Error: The following environment variables are not set: {', '.join(missing_vars)}", "red")
        print_colored("Please create a .env file with your API keys.", "red")
        return False
    
    return True

def get_pdf_hash(pdf_path):
    """
    Create a hash of the PDF file to use as an identifier
    
    Args:
        pdf_path (str): Path to the PDF file
    
    Returns:
        str: MD5 hash of the PDF file
    """
    import hashlib
    with open(pdf_path, "rb") as file:
        return hashlib.md5(file.read()).hexdigest()
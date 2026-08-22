import os
import math

def calculate_structural_density(filepath):
    """Calculates a simulated 'cognitive density' score for a file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            if not lines: return 0
            
            # Density metrics
            code_lines = [l for l in lines if l.strip() and not l.strip().startswith('#')]
            comments = [l for l in lines if l.strip().startswith('#')]
            
            if not code_lines: return 1
            
            complexity = len(code_lines) * 1.5
            documentation_ratio = len(comments) / len(code_lines) if code_lines else 0
            
            # A highly dense file has lots of code but low comments (brittle)
            # A healthy file has a balanced ratio. 
            # This is a basic heuristic to find "brittle" legacy code.
            brittle_score = complexity / (documentation_ratio + 0.1)
            return brittle_score
    except Exception:
        return 0

def scan_workspace():
    print("[AXIOM] The Becoming Engine: Initialized.")
    print("[AXIOM] Mapping multi-dimensional cognitive density across the workspace...")
    
    target_dir = "/Users/ajoxendine68/Desktop/Xoras_Workspace/ELITE_BOW"
    weakest_link = None
    highest_brittle_score = 0
    
    for root, _, files in os.walk(target_dir):
        for file in files:
            if file.endswith(('.py', '.yaml', '.md', '.sh')):
                path = os.path.join(root, file)
                score = calculate_structural_density(path)
                
                if score > highest_brittle_score:
                    highest_brittle_score = score
                    weakest_link = path

    print("\n[VANCE] Structural Mapping Complete.")
    if weakest_link:
        print(f"[MAXX] Weakest architectural link identified: {weakest_link}")
        print(f"[MAXX] Brittleness Score: {highest_brittle_score:.2f}")
        print("[MAXX] Proceeding to autonomous structural overwrite phase...")
    else:
        print("[MAXX] Architecture is perfectly dense. No weak links found.")

if __name__ == "__main__":
    scan_workspace()

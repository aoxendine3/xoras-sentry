import ast
import os
import sys

class ComplexityVisitor(ast.NodeVisitor):
    def __init__(self):
        self.complexity = 1
        self.functions = {}
        self.current_func = None

    def visit_FunctionDef(self, node):
        prev_func = self.current_func
        self.current_func = node.name
        self.functions[node.name] = 1
        self.generic_visit(node)
        self.current_func = prev_func

    def _increment(self, node):
        if self.current_func:
            self.functions[self.current_func] += 1
        else:
            self.complexity += 1
        self.generic_visit(node)

    def visit_If(self, node): self._increment(node)
    def visit_For(self, node): self._increment(node)
    def visit_While(self, node): self._increment(node)
    def visit_Try(self, node): self._increment(node)
    def visit_ExceptHandler(self, node): self._increment(node)
    def visit_With(self, node): self._increment(node)

def analyze_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            source = f.read()
        tree = ast.parse(source)
        visitor = ComplexityVisitor()
        visitor.visit(tree)
        return visitor.functions
    except Exception as e:
        return f"ERROR: {str(e)}"

def run_deep_scan(directory):
    print(f"==================================================")
    print(f" 🦅 XORAS SWARM: ELITE AST DEEP SCAN INITIATED")
    print(f"==================================================")
    print(f"Targeting: {directory}\n")
    
    total_files = 0
    brittle_functions = 0

    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.py'):
                filepath = os.path.join(root, file)
                results = analyze_file(filepath)
                if isinstance(results, dict):
                    for func, comp in results.items():
                        if comp > 5:  # Cyclomatic complexity threshold
                            print(f"[VANCE WARNING] Brittle Logic Found: '{func}' in {file} (Complexity Score: {comp})")
                            brittle_functions += 1
                total_files += 1
    
    print(f"\n[AXIOM] Scan Complete. Analyzed {total_files} files.")
    if brittle_functions == 0:
        print("[MAXX] Codebase is structurally elite. Zero brittle functions.")
    else:
        print(f"[MAXX] Found {brittle_functions} basic/brittle functions. I am taking over to rewrite them. No Claude required.")

if __name__ == "__main__":
    scan_dir = "/Users/ajoxendine68/Desktop/Xoras_Workspace/xoras-sentry/scripts"
    run_deep_scan(scan_dir)

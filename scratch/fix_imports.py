import os
import re

pages_dir = "src/pages"
types_to_extract = {"Role", "PurchaseRequest", "PRStatus", "PRItem", "User", "Vendor"}

for root, dirs, files in os.walk(pages_dir):
    for file in files:
        if file.endswith(".tsx"):
            file_path = os.path.join(root, file)
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()

            modified = False

            # 1. Handle ProcurementContext imports which might bundle types
            def replace_procurement_import(match):
                imports_str = match.group(1)
                # Split and clean imported items
                items = [item.strip() for item in imports_str.split(",")]
                types_found = [item for item in items if item in types_to_extract]
                non_types = [item for item in items if item not in types_to_extract and item]

                new_lines = []
                if non_types:
                    new_lines.append(f"import {{ {', '.join(non_types)} }} from \"../../contexts\";")
                if types_found:
                    new_lines.append(f"import type {{ {', '.join(types_found)} }} from \"../../types\";")
                
                return "\n".join(new_lines)

            # Match: import { ... } from "../context/ProcurementContext";
            proc_pattern = r'import\s+\{\s*([^}]+)\s*\}\s+from\s+"../context/ProcurementContext";?'
            if re.search(proc_pattern, content):
                content = re.sub(proc_pattern, replace_procurement_import, content)
                modified = True

            # 2. Handle simple contexts: LanguageContext and ThemeContext
            lang_pattern = r'import\s+\{\s*([^}]+)\s*\}\s+from\s+"../context/LanguageContext";?'
            if re.search(lang_pattern, content):
                content = re.sub(lang_pattern, r'import { \1 } from "../../contexts";', content)
                modified = True

            theme_pattern = r'import\s+\{\s*([^}]+)\s*\}\s+from\s+"../context/ThemeContext";?'
            if re.search(theme_pattern, content):
                content = re.sub(theme_pattern, r'import { \1 } from "../../contexts";', content)
                modified = True

            # 3. Handle component imports: replace "../components/" with "../../components/"
            comp_pattern = r'from\s+"\.\./components/'
            if re.search(comp_pattern, content):
                content = re.sub(comp_pattern, 'from "../../components/', content)
                modified = True

            # Write back if modified
            if modified:
                with open(file_path, "w", encoding="utf-8") as f:
                    f.write(content)
                print(f"Refactored imports in {file_path}")

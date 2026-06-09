import os
import re

src_dir = "src"

for root, dirs, files in os.walk(src_dir):
    for file in files:
        if file.endswith((".tsx", ".ts")):
            file_path = os.path.join(root, file)
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()

            modified = False

            # Match: from "react-router" or from 'react-router'
            rr_pattern = r'from\s+["\']react-router["\']'
            if re.search(rr_pattern, content):
                content = re.sub(rr_pattern, 'from "react-router-dom"', content)
                modified = True

            if modified:
                with open(file_path, "w", encoding="utf-8") as f:
                    f.write(content)
                print(f"Replaced react-router with react-router-dom in {file_path}")

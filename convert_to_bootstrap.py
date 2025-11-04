"""
Script untuk mengonversi Material-UI components ke Bootstrap
untuk semua file React di project
"""

import os
import re

# Mapping dari Material-UI ke Bootstrap
MUI_TO_BOOTSTRAP_MAP = {
    # Import statements
    r"import\s+\{[^}]*Button[^}]*\}\s+from\s+['\"]@mui/material['\"];?": "",
    r"import\s+\{[^}]*TextField[^}]*\}\s+from\s+['\"]@mui/material['\"];?": "",
    r"import\s+\{[^}]*Select[^}]*\}\s+from\s+['\"]@mui/material['\"];?": "",
    r"import\s+.*from\s+['\"]@mui/material['\"];?": "",
    r"import\s+.*from\s+['\"]@emotion/[^'\"]+['\"];?": "",
    
    # Button components
    r'<Button\s+variant="contained"([^>]*)>': r'<button className="btn btn-primary"\1>',
    r'<Button\s+variant="outlined"([^>]*)>': r'<button className="btn btn-outline-primary"\1>',
    r'<Button\s+variant="text"([^>]*)>': r'<button className="btn btn-link"\1>',
    r'<Button([^>]*)>': r'<button className="btn btn-primary"\1>',
    r'</Button>': '</button>',
    
    # TextField to input/textarea
    r'<TextField\s+([^/]*?)multiline([^/]*?)/>': r'<textarea className="form-control" \1 \2></textarea>',
    r'<TextField\s+([^/]*?)/>': r'<input className="form-control" \1 />',
    
    # Select to select
    r'<Select([^>]*)>': r'<select className="form-select"\1>',
    r'</Select>': '</select>',
    r'<MenuItem([^>]*)>': r'<option\1>',
    r'</MenuItem>': '</option>',
    
    # FormControl
    r'<FormControl([^>]*)>': r'<div className="mb-3"\1>',
    r'</FormControl>': '</div>',
    
    # InputLabel
    r'<InputLabel([^>]*)>': r'<label className="form-label"\1>',
    r'</InputLabel>': '</label>',
    
    # Checkbox
    r'<Checkbox([^>]*)/>': r'<input type="checkbox" className="form-check-input"\1 />',
    r'<FormControlLabel([^>]*)>': r'<div className="form-check"\1>',
    r'</FormControlLabel>': '</div>',
    
    # Radio
    r'<Radio([^>]*)/>': r'<input type="radio" className="form-check-input"\1 />',
    r'<RadioGroup([^>]*)>': r'<div\1>',
    r'</RadioGroup>': '</div>',
    
    # Box/Container components
    r'<Box([^>]*)>': r'<div\1>',
    r'</Box>': '</div>',
    
    # Chip/Badge
    r'<Chip([^>]*)/>': r'<span className="badge bg-secondary"\1></span>',
    
    # CSS properties conversion
    r'color="primary"': 'className="text-primary"',
    r'color="secondary"': 'className="text-secondary"',
    r'color="error"': 'className="text-danger"',
    r'color="success"': 'className="text-success"',
    r'color="warning"': 'className="text-warning"',
    r'size="small"': 'className="btn-sm"',
    r'size="large"': 'className="btn-lg"',
    
    # Style attributes
    r'fullWidth': 'className="w-100"',
}

def convert_file(file_path):
    """Convert a single file from Material-UI to Bootstrap"""
    print(f"Converting: {file_path}")
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Apply all conversions
        for pattern, replacement in MUI_TO_BOOTSTRAP_MAP.items():
            content = re.sub(pattern, replacement, content, flags=re.MULTILINE)
        
        # Only write if changes were made
        if content != original_content:
            # Backup original file
            backup_path = file_path.replace('.js', '_MUI_backup.js')
            if not os.path.exists(backup_path):
                with open(backup_path, 'w', encoding='utf-8') as f:
                    f.write(original_content)
            
            # Write converted content
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            print(f"  ✓ Converted successfully")
            return True
        else:
            print(f"  - No changes needed")
            return False
            
    except Exception as e:
        print(f"  ✗ Error: {str(e)}")
        return False

def convert_directory(directory):
    """Convert all JS/JSX files in directory"""
    converted_count = 0
    
    for root, dirs, files in os.walk(directory):
        # Skip node_modules and build directories
        if 'node_modules' in root or 'build' in root or '_backup' in root:
            continue
            
        for file in files:
            if file.endswith(('.js', '.jsx')) and not file.endswith('_backup.js'):
                file_path = os.path.join(root, file)
                if convert_file(file_path):
                    converted_count += 1
    
    return converted_count

if __name__ == "__main__":
    print("=" * 60)
    print("Material-UI to Bootstrap Converter")
    print("=" * 60)
    print()
    
    # Convert pages directory
    pages_dir = os.path.join(os.path.dirname(__file__), 'src', 'pages')
    components_dir = os.path.join(os.path.dirname(__file__), 'src', 'components')
    
    print("Converting pages...")
    pages_converted = convert_directory(pages_dir)
    
    print()
    print("Converting components...")
    components_converted = convert_directory(components_dir)
    
    print()
    print("=" * 60)
    print(f"Conversion complete!")
    print(f"Pages converted: {pages_converted}")
    print(f"Components converted: {components_converted}")
    print(f"Total files converted: {pages_converted + components_converted}")
    print("=" * 60)
    print()
    print("Note: Original files have been backed up with '_MUI_backup.js' suffix")
    print("Please review the converted files and test thoroughly!")

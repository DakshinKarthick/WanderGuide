import docx
import os

def inspect_docx(file_path):
    if not os.path.exists(file_path):
        print(f"Error: {file_path} not found.")
        return

    doc = docx.Document(file_path)
    print("--- Headings in report.docx ---")
    for i, para in enumerate(doc.paragraphs):
        if para.style.name.startswith('Heading') or para.text.isupper() and len(para.text) > 3:
            print(f"{i}: [{para.style.name}] {para.text}")
    print("--- End of Headings ---")

if __name__ == "__main__":
    inspect_docx(r"c:\Users\Dinesh.LAPTOP-OO5HEB93\Downloads\WanderGuide-main (1)\WanderGuide-main\report.docx")

import docx
import os

def read_full_text(file_path):
    if not os.path.exists(file_path):
        print(f"Error: {file_path} not found.")
        return

    doc = docx.Document(file_path)
    print("--- FULL TEXT of report.docx ---")
    for para in doc.paragraphs:
        print(para.text)
    print("--- End of TEXT ---")

if __name__ == "__main__":
    read_full_text(r"c:\Users\Dinesh.LAPTOP-OO5HEB93\Downloads\WanderGuide-main (1)\WanderGuide-main\report.docx")

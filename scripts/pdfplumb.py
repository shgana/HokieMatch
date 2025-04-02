import pdfplumber

with pdfplumber.open("/Users/shyam/HokieMatch/data/my_dars.pdf") as pdf:
    with open("plumber_output.txt", "w", encoding="utf-8") as f:
        for page in pdf.pages:
            lines = page.extract_text().split('\n')
            for line in lines:
                f.write(line.strip() + "\n")
